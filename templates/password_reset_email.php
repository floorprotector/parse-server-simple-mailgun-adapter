<?php

// Test this page with:
// http://yourdomain.com/appTemplates/password_reset_email.php?json=false&email=testEmailAddress&appName=YourApp&link=www.yourdomain.com&languageCode=en


$retJson = $_GET['json'];
$email = $_GET['email'];
$appName = $_GET['appName'];
$link = $_GET['link'];
$languageCode = $_GET['languageCode'];

$subject = "New password for $appName";

$text =  <<<EOT
Hi,

you requested to reset your password for $appName.

Click to $link and follow the prompts. Please remember that you must consider upper/lower case when entering the password.

You do not want to change your password? Then you can ignore this email.
EOT;

switch($languageCode)
{
case 'de':
	$subject = "Neues Passwort für $appName";
	$text = <<<EOT
Hallo,

über $appName wurde ein neues Passwort angefordert.

Klicken Sie dazu $link und befolgen Sie die Eingabeaufforderungen. Bitte denken Sie daran, dass Sie bei der Eingabe des Passworts die Groß-/Kleinschreibung beachten müssen.

Sie möchten Ihr Passwort nicht ändern? Dann können Sie diese E-Mail ignorieren.
EOT;

	break;
case 'fr':
	//TODO...
	break;
}

$html = <<<EOT
<!DOCTYPE html>
<html>
  <head>
  <title id='pageTitleID'>$subject</title>
</head>
  <body>
	<div id='border'>
	  <h1 id='contentArea'>
		<div id='subtitle'>test title</div>
	  </h1>
	  <div id='message'> $text  or other html code...</div>
    </div>
  </body>
</html>
EOT;

if ($retJson == 'true') {
	$data['subject'] = $subject;
	$data['text'] = $text;
	$data['html'] = $html;
	$data['to'] = $email;
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($data);
}
else {
	header('Content-type: text/html; charset=utf-8');
	echo $html;
}
?>
