<?php

namespace SkreenHouseFactory\v3Bundle\Api;

use Guzzle\Http\Client;


class ApiManager
{
  protected $api_base = 'http://benoit.myskreen.typhon.net/api/1/';
  protected $api_format = null;

  public function __construct($api_base = null, $api_format = 'json') {
    if ($api_base) {
      $this->api_base = $api_base;
    }
    $this->api_format = $api_format;
  }

  public function fetch($url, $params = array(), $method = 'GET') {
    
    $client = new Client($this->api_base, $params);

    switch ($method) {
      case 'POST':
        $response = $client->post($url.'.'.$this->api_format)->send();
      break;
      case 'GET':
        $response = $client->get($url.'.'.$this->api_format)->send();
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