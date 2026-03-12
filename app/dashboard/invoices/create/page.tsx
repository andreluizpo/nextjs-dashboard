import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";

export default async function Page() {
  // Faz uma busca dos clientes
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Faturas", href: "/dashboard/invoices" },
          {
            label: "Criar Fatura",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />
      {/* Envia os clientes encontrados para o formulário */}
      <Form customers={customers} />
    </main>
  );
}
