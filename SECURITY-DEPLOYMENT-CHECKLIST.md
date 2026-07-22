# EcoFlow PR security deployment checklist

Do not merge or deploy this branch until the coordinated Power Solar CRM change is ready.

## Required variables

Create server-only values in Vercel:

- `CRM_ECOFLOW_SERVICE_SECRET`: same dedicated value configured in Power Solar CRM.
- `CRM_QUOTE_TOKEN`: separate EcoFlow-only internal token.
- A newly rotated `GAS_TOKEN` only where the lead workflow still requires it.
- Existing email and public URL settings.

Never accept or store a Power Solar CRM browser session in EcoFlow PR.
Never reuse `GAS_TOKEN` as the CRM-to-EcoFlow service credential.

## Required validation

- Missing service signature returns 401.
- Invalid signature returns 401.
- Modified body after signing returns 401.
- Timestamp older than five minutes returns 401.
- `X-CRM-Session` provides no access.
- `X-GAS-Token` provides no access.
- A valid signed service request can generate the expected quote.
- The direct `/api/crm-quote` route is handled through the signed gateway.

## Secret exposure response

A credential-like GAS value previously appeared in the public `.env.example`. Treat the old value as exposed:

1. Generate a new random token.
2. Update Google Apps Script, Power Solar CRM and EcoFlow PR in one maintenance window.
3. Verify the new token.
4. Revoke the old value.
5. Search Git history and other branches for additional occurrences.

## Deployment order

1. Configure `CRM_ECOFLOW_SERVICE_SECRET` and `CRM_QUOTE_TOKEN` in EcoFlow PR.
2. Configure the matching service secret in Power Solar CRM.
3. Merge and deploy EcoFlow PR after CI passes.
4. Merge and deploy Power Solar CRM after its CI passes.
5. Test only with fictitious customer data.
6. Rotate the old GAS token after both applications are ready.
