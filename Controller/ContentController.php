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

class ContentController extends Controller
{

    /**
    * program
    */
    public function programAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $datas = $api->fetch('program/'.$request->get('id'), 
                           array(
                             'img_width' => 450,
                             'img_height' => 600,
                             'with_metadata'  => true,
                             'with_related' => true,
                             'with_offers' => true,
                             'with_teaser' => true,
                             'with_player' => true,
                             'player' => 'flash'
                           ));
      //print_r($datas);
      //echo $api->url;
      //echo $request->getUri();
      //post treatment
      $datas->boutons = (array)$datas->boutons[0];

      //load programs
      foreach ($datas->related as $key => $r) {
        if ($r->name == 'promo_channel') {
          continue;
        }
        $datas->related[$key]->programs = (array)$api->fetch('recommend/from_program/'.$request->get('id'), 
                                                              array(
                                                                'img_width' => 150,
                                                                'img_height' => 200,
                                                                'with_method'  => $r->name,
                                                                'programs_only' => true
                                                              ));
        //echo "\n name:".$r->name.' : '.end($datas->related[$key]->programs)->id;
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Content:program.html.twig', array(
        'program' => $datas,
        'offers' => array('deportes' => 'sur mySkreen', 
                          'plays' => 'Replay et Vod', 
                          'broadcasts' => 'A la télé', 
                          'theaters' => 'Au cinéma',
                          'itunes' => 'iTunes', 
                          'dvds' => 'En Dvd', 
                          'boxs' => 'Sur les box')
      ));
    }

    /**
    * channel
    */
    public function programtheatersAction(Request $request)
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

      return $this->render('SkreenHouseFactoryV3Bundle:Content:programtheaters.html.twig', array(
                'program' => $program,
                'cinemas' => $cinemas,
                'days' => array('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche')
             ));
    }

    /**
    * channel
    */
    public function channelAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $datas = $api->fetch('channel/'.$request->get('id'), 
                           array(
                             'with_live'  => true,
                             'with_next_live' => true,
                             'with_prev_live' => true,
                             'with_description'  => true,
                             'img_width' => 150,
                             'img_height' => 200,
                             'live_img_width' => 300,
                             'live_img_height' => 300,
                             'with_epg' => true,
                             'with_replay' => true,
                             'with_best_offer' => true
                           ));
      //print_r($datas);
      //echo $api->url;
      //echo $datas->seo_url.' = '.$request->get('slug');
      //echo $request->getUri();
      if ($datas->seo_url != 'http://v3.myskreen.com/replay/'.$request->get('id').'-'.$request->get('slug') ||
          !strstr($request->getUri(), 'http://v3.')) {
        throw $this->createNotFoundException('La chaîne n\'existe pas');
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Content:channel.html.twig', 
                            array('channel' => $datas)
                           );
    }
}