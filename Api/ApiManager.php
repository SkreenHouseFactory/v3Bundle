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
  public $host = null;

  public function __construct($format = '.json', $version = '2,3') {
    $this->base = $this->getApiBase($version);
    $this->format = $format;
  }
  
  public function setLogger(Logger $logger)
  {
    $this->logger = $logger;
  }

  protected function getApiBase($version) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https:' : 'http:';
    if (preg_match('/v3\.(\w+)\.myskreen\.typhon\.net/', $_SERVER['SERVER_NAME'], $matches)) {
      $this->host = '//'.$matches[1].'.myskreen.typhon.net';
    } elseif (isset($_SERVER['SERVER_NAME']) && 
              strstr($_SERVER['SERVER_NAME'], 'preprod')) {
      $this->host = '//preprod-api.myskreen.com';
    } else {
      $this->host = '//api.myskreen.com';
    }
    return $protocol.$this->host.'/api/' . $version . '/';
  }

  public function fetch($url, $params = array(), $method = 'GET', $options = array()) {
    //echo $this->base;
    //echo $this->url;
    $params['fromWebsite'] = 'v3';
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
        //echo $this->url; exit();
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
