var mailcomposer = require('mailcomposer');
var Mailgun = require('mailgun-js');
var request = require('request');

var SimpleMailgunAdapter = mailgunOptions => {
  var mailgun
  if (!mailgunOptions || !mailgunOptions.fromAddress) {
    throw 'SimpleMailgunAdapter requires a fromAddress';
  }

  if (typeof mailgunOptions.mailgun !== 'undefined') {
    mailgun = mailgunOptions.mailgun;
  } else {
    if (!mailgunOptions || !mailgunOptions.apiKey || !mailgunOptions.domain) {
      throw 'SimpleMailgunAdapter requires an API Key and domain.';
    }
    mailgun = Mailgun(mailgunOptions);
  }

  var sendVerificationEmail = options => {
	sendTemplateEmail(defaultVerificationEmail(options),options.verifyEmailTemplate,options);
  }

  var sendPasswordResetEmail = options => {
  	sendTemplateEmail(defaultResetPasswordEmail(options),options.passwordResetEmailTemplate,options);
  }
  
  var sendTemplateEmail = function(defaultEmail, template, options) {
  	// get json Object from template url:
  	var languageCode = options.user.get("emailLanguageCode");
  	if (!(typeof languageCode === 'string' && languageCode.length == 2)) {
	  	languageCode = "en";
  	}
  	var decodedURI = template + "?json=true&email=" + options.user.get("email") + "&appName=" + options.appName + "&link=" + options.link + "&languageCode=" + languageCode;
  	var encodedURI = encodeURIComponent(decodedURI);
  	
	request(encodedURI, function (error, response, body) {
		console.log(JSON.stringify(response));
		var mail = defaultEmail;
		if (!error && response.statusCode == 200) {
			var mailFromTemplate = JSON.parse(response.responseText);
			if (typeof mailFromTemplate.subject === 'string' && typeof mailFromTemplate.text === 'string' && (typeof mailFromTemplate.html === 'string' || !mailgunOptions.mime) && typeof mailFromTemplate.to === 'string') {
			mail = mailFromTemplate;
			}
  		}
		sendMail(mail);
	});  	
  };
  
  var defaultVerificationEmail = function({link, user, appName, }) {
    let text = "Hi,\n\n" +
	      "You are being asked to confirm the e-mail address " + user.get("email") + " with " + appName + "\n\n" +
	      "" +
	      "Click here to confirm it:\n" + link;
    let to = user.get("email");
    let subject = 'Please verify your e-mail for ' + appName;
    return { text, to, subject };
  }

  var defaultResetPasswordEmail = function({link, user, appName, }) {
    let text = "Hi,\n\n" +
        "You requested to reset your password for " + appName + ".\n\n" +
        "" +
        "Click here to reset it:\n" + link;
    let to = user.get("email");
    let subject =  'Password Reset for ' + appName;
    return { text, to, subject };
  }

  var sendMail = mail => {
    if (mailgunOptions.mime === true) {
      return sendMime(mail);
    } else {
      return sendPlain(mail);
    }
  }
  
  var sendPlain = mail => {
    var data = {
      from: mailgunOptions.fromAddress,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    }

    return new Promise((resolve, reject) => {
      mailgun.messages().send(data, (err, body) => {
        if (err != null) {
          reject(err);
        }
        resolve(body);
      });
    });
  }

  var sendMime = mail => {
    var toAddress = mail.to
    var composeData = {
      from: mailgunOptions.fromAddress,
      to: toAddress,
      subject: mail.subject,
      text: mail.text,
      html: mail.html
    }

    var mime = mailcomposer(composeData)

    return new Promise((resolve, reject) => {
      mime.build((buildErr, message) => {
        if (buildErr != null) {
          reject(err);
        } else {
          var mimeData = {
            to: toAddress,
            message: message.toString('ascii')
          }

          mailgun.messages().sendMime(mimeData, (err, body) => {
            if (typeof err !== 'undefined') {
              reject(err);
            }
            resolve(body);
          });
        }
      })
    })
  }
  
  return Object.freeze({
    sendMail: sendMail,
    sendVerificationEmail: sendVerificationEmail,
    sendPasswordResetEmail: sendPasswordResetEmail
  });
}

module.exports = SimpleMailgunAdapter
