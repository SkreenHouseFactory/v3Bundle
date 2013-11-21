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
			$api = $this->get('api');
      $programs = $api->fetch('program', 
                               array('img_width'  => 150,
                                     'img_height' => 200,
                                     'access'     => 'cinema',
                                     'alpha'      => $alpha));
      $tabAlphas = array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
      //print_r(array($session_uid, $programs));
      $response = $this->render('SkreenHouseFactoryV3Bundle:Cinema:boxoffice.html.twig', array(
        'menus'    => null,
        'alpha'    => $tabAlphas,
        'programs' => $programs
      ));

//      $response->setPublic();
//      $response->setMaxAge(24*3600);
      //$response->headers->addCacheControlDirective('must-revalidate', true);

      return $response;
    }
    
    public function esiBoxOfficeAction(Request $request, $menus, $alpha, $programs) 
    {
      $response = $this->render('SkreenHouseFactoryV3Bundle:Cinema:esi_boxoffice.html.twig', array('menus' => $menus, 'alpha' => $alpha, 'programs' => $programs));
      
      $response->setPublic();
      $response->setMaxAge(24*3600);
      //$response->headers->addCacheControlDirective('must-revalidate', true);

      return $response;
    }

    /**
    * programtheaters
    * block html include/ajax
    */
    public function programAction(Request $request)
    {

      if (!$request->get('id')) {
        throw $this->createNotFoundException('Program id is missing');
      }
      $cinemas = null;
      $radius = null;
			$api = $this->get('api');
      $q = $request->get('q') ? $request->get('q') : $request->request->get('q');
      if ($q || $request->get('theater_ids')) {
        $cinemas = $api->fetch('schedule/cine', array(
          'program_id' => $request->get('id'),
          'theater_ids' => count(explode(',', $request->get('theater_ids'))) < 10 ?  $request->get('theater_ids') : null,
          'with_schedule' => true,
          'q' => $q,
          'with_versions'=> true
        ));
      } elseif ($request->get('latlng')) {
        list ($lat, $lng) = explode(',', $request->get('latlng'));
        $radius_all = array(10, 100, 200, 500, 1000);
        foreach ($radius_all as $radius) { 
          $cinemas = $api->fetch(
            'schedule/cine', array(
            'program_id' => $request->get('id'),
            'with_schedule' => true,
            'fromGeoloc' => true,
            'lat' => $lat,
            'long' => $lng,
  			    'radius' => $radius,
            'with_versions'=> true
          ));
          if (count($cinemas) > 0) {
            break;
          }
        }
      }
      //echo 'theater_ids:' . $request->get('theater_ids');
      //echo $api->url;exit;
      $response = $this->render('SkreenHouseFactoryV3Bundle:Cinema:program.html.twig', array(
			  'cinemas' => $cinemas,
			  'radius' => $radius,
			  'days' => array('Mercredi','Jeudi','Vendredi','Samedi','Dimanche','Lundi','Mardi')
			));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * search
    * block html include/ajax
    */
    public function searchAction(Request $request)
    {
      $cinemas = null;
			$api = $this->get('api');
      if ($request->get('q')) {
        $cinemas = $api->fetch(
          'channel', 
          array(
            'type' => 'cinema',
            'q' => $request->get('q')
        ));
      } elseif ($request->get('latlng')) {
        $cinemas = $api->fetch(
          'channel',
          array(
            'type' => 'cinema',
            'latlng' => $request->get('latlng')
         ));
      }
      //echo $api->url;

      $response = $this->render('SkreenHouseFactoryV3Bundle:Cinema:_popin-search.html.twig', array(
        'cinemas' => $cinemas,
      ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}