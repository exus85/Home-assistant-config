<?php

$settings = array(
	'consumer_key' => '',
	'consumer_secret' => '',
	'access_token' => '',
	'access_token_secret' => ''
);

$params = array(
	'screen_name' => $_GET['screen_name'],
	'count' => $_GET['count'],
	'exclude_replies' => $_GET['exclude_replies'],
	'include_retweets' => $_GET['include_retweets'],
);

require_once('TwitterAPIExchange.php');

$url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
$requestMethod = 'GET';
$getfield = '?screen_name=' . $params['screen_name'] .
			'&count=' . $params['count'] .
			'&trim_user=true' .
			'&exclude_replies=' . $params['exclude_replies'] .
			'&include_rts=' . $params['include_retweets'];

$translated = array(
	'consumer_key' => $settings['consumer_key'],
	'consumer_secret' => $settings['consumer_secret'],
	'oauth_access_token' => $settings['access_token'],
	'oauth_access_token_secret' => $settings['access_token_secret']
);

$twitter = new TwitterAPIExchange($translated);

echo $twitter->setGetfield($getfield)
			 ->buildOauth($url, $requestMethod)
			 ->performRequest();

?>