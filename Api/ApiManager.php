<?php

namespace SkreenHouseFactory\v3Bundle\Api;

use Guzzle\Http\Client;


class ApiManager
{
  protected $api_base = null;
  protected $api_format = null;

  public function __construct($env = 'prod', $api_format = 'json') {
    $this->api_base = $this->getApiBase($env);
    $this->api_format = $api_format;
  }

  protected function getApiBase($env) {
    if ($env == 'dev') {
      return 'http://benoit.myskreen.typhon.net/api/1/';
    } else {
      return 'http://api.myskreen.com/api/1/';
    }
  } 

  public function fetch($url, $params = array(), $method = 'GET', $options = array()) {

    $client = new Client($this->api_base, $options);
    switch ($method) {
      case 'POST':
        $response = $client->post($url . '.' . $this->api_format, 
                                  array('accept' => 'application/json'), 
                                  $params)->send();
      break;
      case 'GET':
        $response = $client->get($url . '.' . $this->api_format . '?' . http_build_query($params))->send();
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