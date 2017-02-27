var mailcomposer = require('mailcomposer');
var AmazonSES = require('amazon-ses-mailer');
var request = require('request');

var SimpleMailgunAdapter = mailgunOptions => {
  var mailgun;
  if (!mailgunOptions || !mailgunOptions.fromAddress) {
    throw 'AmazonSESAdapter requires valid fromAddress.';
  }

	if (!mailgunOptions || !mailgunOptions.accessKeyId || !mailgunOptions.secretAccessKey || !mailgunOptions.region) {
      throw 'AmazonSESAdapter requires valid accessKeyId, secretAccessKey, region.';
    }
    mailgun = new AmazonSES(mailgunOptions.accessKeyId, mailgunOptions.secretAccessKey, mailgunOptions.region);

  var sendVerificationEmail = options => {
	sendTemplateEmail(defaultVerificationEmail(options),mailgunOptions.verifyEmailTemplate,options);
  }

  var sendPasswordResetEmail = options => {
  	sendTemplateEmail(defaultResetPasswordEmail(options),mailgunOptions.passwordResetEmailTemplate,options);
  }
  
  var sendTemplateEmail = function(defaultEmail, template, options) {
  	// get json Object from template url:
  	var languageCode = options.user.get("emailLanguageCode");
  	if (!(typeof languageCode === 'string' && languageCode.length == 2)) {
	  	languageCode = "en";
  	}
  	var encodedURI = template + "?json=true&email=" + encodeURIComponent(options.user.get("email")) + "&appName=" + encodeURIComponent(options.appName) + "&link=" + encodeURIComponent(options.link) + "&languageCode=" + encodeURIComponent(languageCode);
  	
	request(encodedURI, function (error, response, body) {
		var mail = defaultEmail;
		if (!error && response.statusCode == 200) {
			var mailFromTemplate;
			try {
				mailFromTemplate = JSON.parse(body);
			}
			catch (e) {
			}
			if (typeof mailFromTemplate.subject === 'string' && typeof mailFromTemplate.text === 'string' && (typeof mailFromTemplate.html === 'string' || !mailgunOptions.mime) && typeof mailFromTemplate.to === 'string') {
			mail = mailFromTemplate;
			}
  		}
		sendMail(mail);
	});  	
  };
  
  var defaultVerificationEmail = function(options) {
    var text = "Hi,\n\n" +
	      "you are being asked to confirm the e-mail address " + options.user.get("email") + " with " + options.appName + "\n\n" +
	      "" +
	      "Click here to confirm it:\n" + options.link;
    var to = options.user.get("email");
    var subject = 'Please verify your e-mail for ' + options.appName;
    return { text, to, subject };
  }

  var defaultResetPasswordEmail = function(options) {
    var text = "Hi,\n\n" +
        "you requested to reset your password for " + options.appName + ".\n\n" +
        "" +
        "Click here to reset it:\n" + options.link;
    var to = options.user.get("email");
    var subject =  'Password Reset for ' + options.appName;
    return { text, to, subject };
  }

  var sendMail = mail => {
    if (mailgunOptions.mime == 'true') {
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
      body: {
          text: mail.text
      }
    }

    return new Promise((resolve, reject) => {
      mailgun.send(data, (err, body) => {
        if (err != null) {
          reject(err);
        }
        resolve(body);
      });
    });
  }

  var sendMime = mail => {
    var data = {
      from: mailgunOptions.fromAddress,
      to: mail.to,
      subject: mail.subject,
      body: {
          text: mail.text,
          html: mail.html
      }
    }

    return new Promise((resolve, reject) => {
      mailgun.send(data, (err, body) => {
        if (err != null) {
          reject(err);
        }
        resolve(body);
      });
    });

  }
  
  return Object.freeze({
    sendMail: sendMail,
    sendVerificationEmail: sendVerificationEmail,
    sendPasswordResetEmail: sendPasswordResetEmail
  });
}

module.exports = SimpleMailgunAdapter
