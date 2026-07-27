"use client";

import {useQueryClient} from "@tanstack/react-query";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import {ApiError} from "@/lib/api/api-error";

import {login as requestLogin, logoutAuthSession, register as requestRegister} from "../api/auth-api";
import type {AuthSessionData, AuthUser, LoginFormValues, RegisterFormValues} from "../schemas/auth.schema";
import {authSessionStore, type AuthSessionStatus} from "../session/auth-session-store";
import {coordinateAuthRefresh, invalidateAuthRefresh} from "../session/refresh-auth-session";

type AuthActionOptions = Readonly<{
    signal?: AbortSignal;
}>;

type AuthContextValue = Readonly<{
    status: AuthSessionStatus;
    user: AuthUser | null;
    sessionError: ApiError | null;

    login: (values: LoginFormValues, options?: AuthActionOptions) => Promise<AuthSessionData>;

    register: (values: RegisterFormValues, options?: AuthActionOptions) => Promise<AuthSessionData>;

    logout: (options?: AuthActionOptions) => Promise<void>;

    retrySession: () => Promise<void>;

    updateCurrentUserIdentity: (user: AuthUser) => void;
}>;

type AuthProviderProps = Readonly<{
    children: ReactNode;
}>;

type QueryWithMeta = Readonly<{
    meta?: Record<string, unknown>;
}>;

const AuthContext = createContext<AuthContextValue | null>(null);

function isPrivateQuery(query: QueryWithMeta): boolean {
    /*
     * كل Protected Query سننشئها لاحقًا يجب أن تحمل:
     *
     * meta: {
     *     authScope: "private"
     * }
     *
     * حتى نستطيع حذف بيانات المستخدم فقط عند Logout أو Session Expiry.
     */
    return query.meta?.authScope === "private";
}

function isFinalAnonymousError(error: unknown): boolean {
    return error instanceof ApiError && error.kind === "http" && (error.status === 401 || error.status === 403);
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === "AbortError";
}

function normalizeSessionError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    return new ApiError({
        kind: "invalid-response",
        message: "The authentication session could not be resolved",
    });
}

export function AuthProvider({children}: AuthProviderProps) {
    const queryClient = useQueryClient();

    const snapshot = useSyncExternalStore(
        authSessionStore.subscribe,
        authSessionStore.getSnapshot,
        authSessionStore.getServerSnapshot
    );

    const [sessionError, setSessionError] = useState<ApiError | null>(null);

    const bootstrapPromiseRef = useRef<Promise<void> | null>(null);
    const previousStatusRef = useRef<AuthSessionStatus>(snapshot.status);

    const clearPrivateQueryCache = useCallback(async (): Promise<void> => {
        /*
         * نلغي Protected Queries الجارية أولًا، ثم نحذف نتائجها.
         * Query Functions يجب أن تمرر AbortSignal إلى HTTP Layer.
         */
        await queryClient.cancelQueries({
            predicate: isPrivateQuery,
        });

        queryClient.removeQueries({
            predicate: isPrivateQuery,
        });
    }, [queryClient]);

    const acceptSession = useCallback(
        async (session: AuthSessionData): Promise<void> => {
            /*
             * تمنع أي Bootstrap أو Refresh أقدم من أن تكتب فوق
             * الجلسة التي أنشأها Login/Register الحالي.
             */
            invalidateAuthRefresh();

            setSessionError(null);

            /*
             * حماية في حال دخل مستخدم جديد بعد جلسة مستخدم سابق.
             * لا نسمح بظهور Private Cache قديمة للحساب الجديد.
             */
            await clearPrivateQueryCache();

            authSessionStore.setSession(session);
        },
        [clearPrivateQueryCache]
    );

    const runSessionBootstrap = useCallback((): Promise<void> => {
        if (bootstrapPromiseRef.current) {
            return bootstrapPromiseRef.current;
        }

        /*
         * لا نعيد Bootstrap إذا كانت الحالة حُسمت بالفعل.
         * إعادة المحاولة اليدوية تحوّل الحالة إلى checking أولًا.
         */
        if (authSessionStore.getSnapshot().status !== "checking") {
            return Promise.resolve();
        }

        setSessionError(null);

        const bootstrapPromise = coordinateAuthRefresh()
        .then(() => undefined)
        .catch((error: unknown) => {
            /*
             * Abort هنا يعني غالبًا أن Login أو Logout أحدث
             * ألغى Bootstrap القديمة، وليس خطأ نعرضه للمستخدم.
             */
            if (isAbortError(error)) {
                return;
            }

            /*
             * 401/403 النهائية تحسم أن المستخدم Anonymous.
             * refresh coordinator يكون قد مسح الجلسة بالفعل.
             */
            if (isFinalAnonymousError(error)) {
                setSessionError(null);
                return;
            }

            /*
             * Network أو invalid-response لا تعني Anonymous.
             * نبقي status = checking ونسمح للواجهة بعرض Retry.
             */
            setSessionError(normalizeSessionError(error));
        })
        .finally(() => {
            if (bootstrapPromiseRef.current === bootstrapPromise) {
                bootstrapPromiseRef.current = null;
            }
        });

        bootstrapPromiseRef.current = bootstrapPromise;

        return bootstrapPromise;
    }, []);

    const retrySession = useCallback(async (): Promise<void> => {
        invalidateAuthRefresh();
        authSessionStore.markChecking();
        setSessionError(null);

        await runSessionBootstrap();
    }, [runSessionBootstrap]);



const updateCurrentUserIdentity = useCallback((user: AuthUser): void => {
    /*
     * تحديث الاسم أو الصورة لا ينشئ جلسة جديدة،
     * ولا يغير Access Token أو CSRF Token.
     *
     * Store تتحقق أيضًا أن نتيجة التحديث تخص
     * المستخدم الحالي نفسه.
     */
    authSessionStore.updateCurrentUser(user);
}, []);




    const login = useCallback(
        async (values: LoginFormValues, options: AuthActionOptions = {}): Promise<AuthSessionData> => {
            /*
             * Login تملك الآن انتقال الجلسة، لذلك نلغي أي Refresh أقدم.
             */
            invalidateAuthRefresh();

            const session = await requestLogin(values, options);

            await acceptSession(session);

            return session;
        },
        [acceptSession]
    );

    const register = useCallback(
        async (values: RegisterFormValues, options: AuthActionOptions = {}): Promise<AuthSessionData> => {
            invalidateAuthRefresh();

            const session = await requestRegister(values, options);

            await acceptSession(session);

            return session;
        },
        [acceptSession]
    );

    const logout = useCallback(
        async (options: AuthActionOptions = {}): Promise<void> => {
            /*
             * يجب التقاط CSRF قبل مسح الذاكرة؛ لأن طلب Logout يحتاجها.
             */
            const csrfToken = authSessionStore.getCsrfToken();

            /*
             * الإلغاء المحلي يحدث فورًا ولا ينتظر الشبكة.
             * فلا يستطيع المستخدم بدء Protected Actions جديدة
             * أثناء انتظار Render أو اتصال بطيء.
             */
            invalidateAuthRefresh();
            authSessionStore.clearSession();
            setSessionError(null);

            await clearPrivateQueryCache();

            /*
             * إذا ضاعت CSRF من الذاكرة، ما زلنا نعتبر المستخدم
             * مسجل خروج محليًا. لا نحاول اختراع Token جديدة هنا.
             */
            if (!csrfToken) {
                return;
            }

            /*
             * قد يفشل السيرفر أو الشبكة، لكن Local Logout حدث بالفعل.
             * الـCaller يستطيع عرض رسالة هادئة عن تعذر تنظيف
             * الجلسة البعيدة دون إعادة المستخدم إلى authenticated.
             */
            await logoutAuthSession({
                csrfToken,
                signal: options.signal,
            });
        },
        [clearPrivateQueryCache]
    );

    /*
     * Browser-only session bootstrap.
     *
     * Root Server Component لا يستطيع قراءة Refresh Cookie الموجودة
     * على Render، لذلك يبدأ الحسم بعد Hydration داخل المتصفح.
     */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void runSessionBootstrap();
    }, [runSessionBootstrap]);

    /*
     * إذا انتهت الجلسة من داخل Authorized API Client، فإن ذلك العميل
     * يمسح Auth Store. الـProvider يلاحظ الانتقال ويحذف Private Cache.
     */
    useEffect(() => {
        const previousStatus = previousStatusRef.current;

        previousStatusRef.current = snapshot.status;

        if (previousStatus === "authenticated" && snapshot.status === "anonymous") {
            setSessionError(null);
            void clearPrivateQueryCache();
        }
    }, [clearPrivateQueryCache, snapshot.status]);

   const value = useMemo<AuthContextValue>(
       () => ({
           status: snapshot.status,
           user: snapshot.user,
           sessionError,
           login,
           register,
           logout,
           retrySession,
           updateCurrentUserIdentity,
       }),
       [login, logout, register, retrySession, sessionError, snapshot.status, snapshot.user, updateCurrentUserIdentity]
   );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside the AuthProvider");
    }

    return context;
}
