<?php

/*
 * This file is part of the SkreenHouseFactoryV3Bundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\v3Bundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;

class MainController extends Controller
{
    /**
    *
    */
    public function homeAction(Request $request)
    {

      //return $this->render('SkreenHouseFactoryV3Bundle:Home:home.html.twig');

      //menus
      $api = new ApiManager('http://benoit.myskreen.typhon.net/api/1/');
      $menus = $api->fetch('www/menu', array('without_footer' => true));

      $response = $this->render('SkreenHouseFactoryV3Bundle:Home:home.html.twig', array(
        'menus' => (array)$menus->menu
      ));
      $response->headers->set('Access-Control-Allow-Origin', 'http://benoit.myskreen.typhon.net');
      $response->headers->set('Access-Control-Allow-Methods', 'POST, GET');
      return $response;
    }
}