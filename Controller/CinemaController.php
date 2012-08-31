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

class CinemaController extends Controller
{
    /**
    *
    */
    public function boxofficeAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      $alpha       = $request->get('alpha', 'a');
      
      //programs
      $api = new ApiManager($this->container->getParameter('kernel.environment'));
      $programs = $api->fetch('program', 
                               array('img_width'  => 150,
                                     'img_height' => 200,
                                     'access'     => 'cinema',
                                     'alpha'      => $alpha));

      //print_r(array($session_uid, $programs));
      $response = $this->render('SkreenHouseFactoryV3Bundle:Cinema:boxoffice.html.twig', array(
        'menus'    => null,
        'alpha'    => array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
        'programs' => $programs
      ));

      $response->setPublic();
      $response->setMaxAge(24*3600);
      //$response->headers->addCacheControlDirective('must-revalidate', true);

      return $response;
    }
}