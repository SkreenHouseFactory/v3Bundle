<?php

namespace SkreenHouseFactory\v3Bundle\Api;

use Guzzle\Http\Client;
use Monolog\Logger;

class ApiManager
{
  protected $base = null;
  protected $format = null;
  protected $logger;
  public $url = null;

  public function __construct($format = '.json', $version = 2) {
    $this->base = $this->getApiBase($version);
    $this->format = $format;
  }
  
  public function setLogger(Logger $logger)
  {
    $this->logger = $logger;
  }

  protected function getApiBase($version) {
    if (preg_match('/v3\.(\w+)\.myskreen\.typhon\.net/', $_SERVER['SERVER_NAME'], $matches)) {
      return 'http://'.$matches[1].'.myskreen.typhon.net/api/' . $version . '/';
    } elseif (isset($_SERVER['SERVER_NAME']) && 
              strstr($_SERVER['SERVER_NAME'], 'preprod')) {
      return 'http://preprod.api.myskreen.com/api/' . $version . '/';
    } else {
      return 'http://api.myskreen.com/api/' . $version . '/';
    }
  }

  public function fetch($url, $params = array(), $method = 'GET', $options = array()) {
    //echo $this->base;
    //echo $this->url;
    $client = new Client($this->base, $options);
    $time = microtime(true);
    switch ($method) {
      case 'POST':
        $this->url = $url . $this->format;
        //debug
        //echo $this->url; print_r($params);exit();
        $response = $client->post($this->url, array(
          'accept' => 'application/json',
          'curl.options' => array(
              'CURLOPT_SSL_VERIFYHOST'   => false,
              'CURLOPT_SSL_VERIFYPEER' => false,
              'CURLOPT_CERTINFO' => false
          ),
          'ssl.certificate_authority' => false), 
          $params
        )->send();
      break;
      case 'GET':
        $separator = strstr($url, '?') ? '&' : $this->format . '?';
        $this->url = $url . $separator . http_build_query($params);
        $response = $client->get($this->url)->send();
      break;
    }

    $time = microtime(true) - $time;

    if (null !== $this->logger) {
      $this->logger->debug(sprintf('API call (%-8sms) to "%s"', round($time*1000, 2), $this->url));
    }

    $json = json_decode($response->getBody(true));

    return $json;
  }

  /**
  * get Object
  */
  public function getObject($name, $id) {
    
    return $this->fetch($name.'/'.$id);
  }
}
