# YK Stitches — Privacy Policy

**Status:** Draft template for legal review  
**Last updated:** 22 October 2026  
**Data controller/operator:** [Insert full legal name and address]  
**Privacy contact:** [Insert verified privacy email]

> This draft describes likely application data flows based on the current code. The operator must verify the deployed configuration, retention, providers, and legal obligations before publication. It is not legal advice.

## 1. Information we may process
Depending on the features you use, the service may process:

- **Account details:** name, email, phone number, profile information, address, and authentication/session data. Passwords should be stored as hashes, never in plain text.
- **Orders:** products, quantities, price and currency, payment status/reference, delivery details, order history, and customer-service communications.
- **Tailoring information:** body measurements, fit preferences, fabric and design choices, special instructions, and fitting-related notes. These details can be personal and should be limited to what is needed.
- **User content:** messages sent to the tailoring assistant, images submitted for order or tailoring purposes, and saved/wishlist items.
- **Operational/security data:** session identifiers, request metadata, rate-limit/security events, staff actions, and audit logs where enabled.

Do not submit information that is not needed to receive the service.

## 2. Purposes and lawful basis
Information may be used to operate accounts, respond to enquiries, prepare and deliver orders, provide tailoring support, maintain customer preferences, protect the service, comply with legal obligations, and resolve disputes. The operator must document an appropriate lawful basis for each purpose under the applicable privacy law and obtain consent where required.

## 3. AI and other service providers
If AI consultation is enabled, messages and context submitted to that feature may be sent to Google Gemini for processing. If Supabase or other hosting/database providers are configured, information may be processed by those providers. The operator must confirm which providers are active, review their contractual privacy terms, set appropriate account and retention settings, and disclose international transfers where applicable. Do not send measurements or other customer data to an AI provider unless this is necessary, disclosed, and appropriately configured.

## 4. Sharing
Information should only be shared with personnel and service providers who need it to operate the service, with the customer's direction, or where law requires or permits it. The operator must document actual recipients and must not sell personal information contrary to applicable law or the published policy.

## 5. Retention and deletion
Set and document retention periods for accounts, orders, measurements, chat messages, uploads, sessions, and security logs. Keep records only as long as needed for the stated purpose and legal requirements, then securely delete or de-identify them. The current app uses in-memory stores for key runtime records; records can be lost when the process restarts, and this is not a production-grade retention system. Implement durable storage, backup, and deletion workflows before handling real customer data.

## 6. Security
The application includes controls such as password hashing, session cookies, access middleware, rate limiting, and security headers. No system can promise absolute security. Production operators must also manage secrets, restrict staff access, protect backups, patch dependencies, monitor incidents, and have a breach-response plan.

## 7. Your rights and choices
Subject to applicable law, you may have rights to access, correct, delete, receive, or restrict use of personal information, object to certain processing, or withdraw consent where processing relies on consent. Contact the verified privacy contact below to make a request. The operator must provide an identity-verification process and respond within applicable deadlines.

## 8. Cookies and similar technologies
Essential session cookies support authentication. The server configures session cookies as HttpOnly and SameSite=Lax, with Secure enabled in production. Review the deployed frontend for browser storage and third-party tags. If non-essential analytics or advertising is added, update the [Cookies Notice](COOKIES.md) and obtain consent where required.

## 9. Children
The operator must decide and publish an age policy suitable for the service and applicable law, and must not knowingly collect children's information without any required authorization.

## 10. International processing
If the operator, customer, or service provider is in another country, personal information may cross borders. Identify the actual transfer destinations and implement required safeguards and notices before launch.

## 11. Changes
Date updates to this policy and communicate material changes where required by law.

## 12. Contact and complaints
**Privacy contact:** [Insert verified monitored email]  
**Business name/address:** [Complete before launch]  
**Regulatory complaint route:** identify the appropriate regulator and process for each relevant jurisdiction after legal review. For Nigeria, assess obligations under the Nigeria Data Protection Act and guidance from the Nigeria Data Protection Commission.
