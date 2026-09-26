<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Data access is client-side via the generated Cloud client; security lives in RLS + has_role() admin checks (roles table, admins seeded by email in handle_new_user trigger). Why: no secret-backed server logic needed.
- Static brand/bank/poster images live in public/assets/. Why: owner asked for directly served paths.
