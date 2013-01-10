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
    * home cinéma
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

    /**
    * programtheaters
    */
    public function programAction(Request $request)
    {
      $cinemas = null;
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      if ($request->get('q') || $request->get('cinema_id')) {
        $cinemas = $api->fetch('schedule/cine', array(
                      'program_id' => $request->get('id'),
                      'theater_ids' => $request->get('cinema_id'),
                      'with_schedule' => true,
                      'q' => $request->get('q')
                    ));
      } elseif ($request->get('latlng')) {
        list ($lat, $lng) = explode(',', $request->get('latlng'));
        $cinemas = $api->fetch('schedule/cine', array(
                      'program_id' => $request->get('id'),
                      'with_schedule' => true,
                      'fromGeoloc' => true,
                      'lat' => $lat,
                      'long' => $lng
                    ));
      }

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $program = $api->fetch('program/'.$request->get('id'), array(
                    'img_width' => 300,
                    'img_height' => 400
                  ));

      $response = $this->render('SkreenHouseFactoryV3Bundle:Cinema:program.html.twig', array(
                'program' => $program,
                'cinemas' => $cinemas,
                'days' => array('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')
             ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}