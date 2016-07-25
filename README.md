# parse-server-fp-simple-mailgun-adapter

Used to send Parse Server password reset and email verification emails through Mailgun

## Use mime with templates
This adapter provides the use of html/text templates for parse-server verifyEmail and passwordResetEmail.

These additional options are available:
- "mime" (true/false) - use mime or text type format
- "verifyEmailTemplate" - URL to your verifyEmail template (php)
- "passwordResetEmailTemplate"  - URL to your passwordResetEmail template (php)

This adapter is only required until the pull request is merged with the offical parse-server-simple-mailgun-adapter.

## Installation

Add dependency to your parse-server package.json:

```
  ...
  "dependencies": {
    "express": "~4.11.x",
    "kerberos": "~0.0.x",
    "parse": "~1.8.0",
    "parse-server-fp-simple-mailgun-adapter": "~1.2.2",
    "parse-server": "~2.2.12"
  }
  ...
```

## Usage
```
...
var emailTemplatesUrl = process.env.EMAIL_TEMPLATES_URL || 'http://yourdomain.com/appTemplates/';
var api = new ParseServer({
  ...
  emailAdapter: {
    module: 'parse-server-fp-simple-mailgun-adapter',
    options: {
      // The address that your emails come from
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@yourdomain.com',
      // Your domain from mailgun.com
      domain: process.env.EMAIL_DOMAIN || 'yourdomain.com',
      // Your API key from mailgun.com
      apiKey: process.env.EMAIL_API_KEY || '',
      // Optional: activate mime type:
      mime: process.env.EMAIL_MIME || false,      
      // Optional: Your link to verifyEmail template (see folder templates for an example)
      verifyEmailTemplate: emailTemplatesUrl + 'verify_email.php',
      // Optional: Your link to passwordResetEmail template (see folder templates for an example)
      passwordResetEmailTemplate: emailTemplatesUrl + 'password_reset_email.php'
    }
  },
  customPages: {
    invalidLink: emailTemplatesUrl + 'invalid_link.html',
    verifyEmailSuccess: emailTemplatesUrl + 'verify_email_success.html',
    choosePassword: emailTemplatesUrl + 'choose_password.html',
    passwordResetSuccess: emailTemplatesUrl + 'password_reset_success.html'
  }
  ...
});

```
