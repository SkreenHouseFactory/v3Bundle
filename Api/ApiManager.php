<?php

namespace SkreenHouseFactory\v3Bundle\Api;

use Guzzle\Http\Client;


class ApiManager
{
  protected $base = null;
  protected $format = null;
  public $url = null;

  public function __construct($env = 'prod', $format = '.json', $version = 1) {
    $this->base = $this->getApiBase($env, $version);
    $this->format = $format;
  }

  protected function getApiBase($env, $version) {
    if ($env == 'dev') {
      return 'http://benoit.myskreen.typhon.net/api/' . $version . '/';
    } else {
      return 'http://api.myskreen.com/api/' . $version . '/';
    }
  } 

  public function fetch($url, $params = array(), $method = 'GET', $options = array()) {

    $client = new Client($this->base, $options);
    switch ($method) {
      case 'POST':
        $response = $client->post($url . $this->format, 
                                  array('accept' => 'application/json',
                                        'curl.options' => array(
                                            'CURLOPT_SSL_VERIFYHOST'   => false,
                                            'CURLOPT_SSL_VERIFYPEER' => false,
                                            'CURLOPT_CERTINFO' => false
                                        ),
                                        'ssl.certificate_authority' => false), 
                                  $params)->send();
      break;
      case 'GET':
        $this->url = $url . $this->format . '?' . http_build_query($params);
        $response = $client->get($this->url)->send();
      break;
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