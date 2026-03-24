"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";
import z from "zod";

const formSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Por favor, selecione um cliente.",
  }),
  amount: z.coerce.number().gt(0, {
    message: "Por favor, insira um valor maior que $0.",
  }), // z.coerce - converte o amount de string para o tipo number
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Por favor, selecione o status da fatura.",
  }), // z.enum - valida se o valor está entre o conjunto definido
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = formSchema.omit({ id: true, date: true });
const UpdateInvoice = formSchema.omit({ id: true, date: true });
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function createInvoice(prevState: State, formData: FormData) {
  // Validar campos de formulário usando Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // Se a validação do formulário falhar, retorne os erros imediatamente. Caso contrário, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos ausentes. Falha ao criar a fatura.",
    };
  }

  // Preparar dados para inserção no banco de dados
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Inserir dados no banco de dados
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // Se ocorrer um erro no banco de dados, retorne um erro mais específico.
    return {
      message: "Erro no banco de dados: Falha ao criar a fatura.",
    };
  }

  // Revalidar o cache da página de faturas e redirecionar o usuário.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
