-- Kundportal: företag får läsa egna fakturor.

drop policy if exists invoices_company_select on public.invoices;
create policy invoices_company_select
  on public.invoices
  for select
  to authenticated
  using (company_id = public.current_company_id());
