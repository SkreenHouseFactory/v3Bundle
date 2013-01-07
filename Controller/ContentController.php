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
      //echo $request->get('id');echo $request->get('_route');exit();
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('program/'.$request->get('id'), 
                           array(
                             'img_width' => 450,
                             'img_height' => 600,
                             'episode_img_width' => 80,
                             'episode_img_height' => 50,
                             'episode_img_crop' => 50,
                             'channel_img_width' => 50,
                             'with_metadata'  => true,
                             'with_related' => true,
                             'with_offers' => true,
                             'with_teaser' => true,
                             //'filter_casting' => true,
                             'player' => 'flash'
                           ));

      //print_r($datas);
      //echo $api->url;

      //check url
      //echo $request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url);exit();
      if ($request->getPathInfo() != $datas->seo_url) {
        echo 'redirect '.$request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url);exit();
        //return $this->redirect($datas->seo_url);
      }
      //post treatments
      $datas->offers = (array)$datas->offers;
      if (!isset($datas->episodeof) && 
          isset($datas->datas_offers->episodes) && count((array)$datas->datas_offers->episodes) > 1) {
        foreach ((array)$datas->datas_offers->episodes as $e) {
          $datas->episode_list[$e->title] = $e;
        }
        ksort($datas->episode_list);
      }

      //load programs
      foreach ($datas->related as $key => $r) {
        if ($r->name == 'promo_channel') {
          continue;
        }
        //print_r($r);
        $datas->related[$key]->programs = (array)$api->fetch(str_replace('&onglet', '&_onglet', $r->paginate), 
                                                              array(
                                                                'img_width' => 150,
                                                                'img_height' => 200,
                                                                'programs_only' => true,
                                                                'channel_img_width' => 50,
                                                                'nb_results' => 7,
                                                              ));
        //echo "\n name:".$r->name.' url:'.$api->url;
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
    * programtheaters
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
      //echo $request->getPathInfo() . ' != ' . $datas->seo_url;exit();
      if ('http://v3.myskreen.com' . $request->getPathInfo() != $datas->seo_url) {
        return $this->redirect($datas->seo_url);
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Content:channel.html.twig', 
                            array('channel' => $datas)
                           );
    }

    /**
    * selection
    */
    public function selectionAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('www/slider/pack/'.$request->get('id'), 
                           array(
                             'with_programs'  => true,
                             'with_onglet'  => true,
                             'img_width' => 150,
                             'img_height' => 200
                           ));
      //print_r($datas);
      //echo $api->url;
      //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';
      if ($request->getPathInfo() != $datas->seo_url) {
        return $this->redirect($datas->seo_url);
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Content:selection.html.twig', 
                            array('selection' => $datas)
                           );
    }

    /**
    * category
    */
    public function categoryAction(Request $request)
    {
      $facets = strlen($request->get('facet')) == 1 ? 'alpha:' . $request->get('facet') : 'subcategory:' . $request->get('facet');
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('category', 
                           array(
                             'from_slug'  => $request->get('category_slug'),
                             'with_description' => true,
                             'with_subcategories' => true,
                             'with_programs'  => true,
                             'img_width' => 150,
                             'img_height' => 200,
                             'offset' => 0,
                             'nb_results' => 60,
                             'facets' => $facets
                           ));
      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);
      //print_r($datas);
      //echo $api->url;
      if (!strstr($request->getPathInfo(), $datas->seo_url)) {
        echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';exit();
        //return $this->redirect($datas->seo_url);
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Content:category.html.twig', 
        array('category' => $datas,
              'subcategories' => array_combine(explode(';', $datas->facets_seo_url->subcategory),explode(';', $datas->facets->subcategory)),
              'alpha_available' => explode(';', $datas->facets->alpha),
              'alpha'    => array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')
      ));
    }
}