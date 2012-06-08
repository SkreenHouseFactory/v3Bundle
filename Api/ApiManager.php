<?php

namespace SkreenHouseFactory\v3Bundle\Api;

use Guzzle\Http\Client;


class ApiManager
{
  protected $api_base = null;
  protected $api_format = null;

  public function __construct($api_base, $api_format) {
    $this->api_base   = $api_base;
    $this->api_format = $api_format;
  }

  public function fetch($url, $params = array(), $method = 'GET') {
    
    $client = new Guzzle\Http\Client($this->api_base.$url.'.'.$this->api_format, $params);
    
    switch ($method) {
      case 'POST':
        $reponse = $client->send($client->post());
      break;
      case 'GET':
        $reponse = $client->send($client->get());
      break;
    }

    return json_decode((string)$reponse);
  }

  /**
  * get Object
  */
  public function getObject($name, $id) {
    
    return $this->fetch($name.'/'.$id)
  }
}