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

class AllopassController extends Controller
{

    /**
    * callback
    */
    public function callbackAction(Request $request)
    {
      mail('benoit@myskreen.com', 'Allopass callback', print_r($_REQUEST, true));
      return new Response('Allopass callback: '.print_r($_REQUEST, true));
      $response = $this->render('SkreenHouseFactoryV3Bundle:Modal:signin.html.twig', array(
        ));

      $cache_maxage=3600;
      $response->setCache(array(
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
      ));
      
      return $response;
    }

    /**
    * error
    */
    public function errorAction(Request $request)
    {
      return new Response('Allopass error: '.print_r($_REQUEST, true));
    }

    /**
    * product access
    */
    public function accessAction(Request $request)
    {
      return new Response('Allopass success: '.print_r($_REQUEST, true));
    }
}