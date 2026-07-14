// @vitest-environment jsdom

import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";

import {ThemeToggle} from "@/components/theme/theme-toggle";
import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/input";

const setTheme = vi.hoisted(() => vi.fn());

vi.mock("next-themes", () => ({
    useTheme: () => ({
        setTheme,
        theme: "light",
    }),
}));

describe("core UI components", () => {
    it("keeps a disabled button unavailable", () => {
        render(<Button disabled>حفظ</Button>);

        expect(screen.getByRole("button", {name: "حفظ"})).toBeDisabled();
    });

    it("connects a visible label, description, and error to an input", () => {
        render(
            <Field
                htmlFor="email"
                label="البريد الإلكتروني"
                description="لن يظهر البريد للعامة."
                error="أدخل بريدًا صالحًا."
                required
            >
                <Input
                    id="email"
                    type="email"
                    aria-invalid="true"
                    aria-describedby="email-description email-error"
                />
            </Field>
        );

        const input = screen.getByRole("textbox", {name: "البريد الإلكتروني"});
        expect(input).toBeInvalid();
        expect(input).toHaveAccessibleDescription("لن يظهر البريد للعامة. أدخل بريدًا صالحًا.");
    });

    it("uses an alert role for blocking feedback", () => {
        render(<Feedback variant="danger" title="تعذر الحفظ" description="حاول مرة أخرى." />);

        expect(screen.getByRole("alert")).toHaveTextContent("تعذر الحفظ");
    });

    it("exposes the current theme and changes it through an accessible button", async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

await user.click(screen.getByLabelText("المظهر الحالي: الوضع الفاتح"));
        expect(screen.getByRole("button", {name: "الوضع الفاتح"})).toHaveAttribute("aria-pressed", "true");

        await user.click(screen.getByRole("button", {name: "الوضع الداكن"}));

        expect(setTheme).toHaveBeenCalledWith("dark");
    });
});
