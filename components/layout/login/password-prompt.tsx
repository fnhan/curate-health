"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useToast } from "components/ui/use-toast";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";

const formSchema = z.object({
  password: z.string(),
});

export default function PasswordPrompt() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const res = await fetch("/api/login", {
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Incorrect password",
        description: "Please try again.",
      });
      form.reset();
      return setIncorrectPassword(true), setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex max-w-lg flex-col items-center justify-center space-y-8 py-20"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  className="w-72"
                  type="password"
                  placeholder="Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant={"secondary"}
          className="w-full bg-card hover:bg-card/80"
          type="submit"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : "Login"}
        </Button>
      </form>
    </Form>
  );
}
