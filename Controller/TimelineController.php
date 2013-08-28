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

class TimelineController extends Controller
{
    /**
    * grid
    */
    public function gridAction(Request $request)
    {
      switch ($request->get('date')) {
        case 'hier-soir':
          $timestamp = mktime(20, 0, 0, date('m'), date('d')-1, date('Y'));
        break;
        case 'ce-soir':
          $timestamp = mktime(20, 0, 0, date('m'), date('d'), date('Y'));
        break;
        case 'en-ce-moment':
          $timestamp = mktime(date('H'), 0, 0, date('m'), date('d'), date('Y'));
        break;
        default:
          if (is_numeric($request->get('date'))) {
            $timestamp = $request->get('date');
          } elseif ($request->get('date')) {
            $timestamp = strtotime(str_replace('-', ' ', $request->get('date')));
          } else {
            $timestamp = mktime(20,0,0,date('m'),date('d'),date('Y'));
          }
        break;
      }

      $api = $this->get('api');
      $data = $api->fetch(
        'schedule/epg', array(
        'timestamp' => $timestamp,
        'img_width' => 150,
        'img_height' => 200,
        'channel_img_width' => 65,
        'session_uid' => $request->get('session_uid'),
        'channels_ids' => $request->get('channels_ids'),
        'with_related_sliders' => $request->get('schedule-only') ? false : true,
        'with_best_offer' => true,
        'with_player' => true,
        'time' => time()
      ));
      echo $api->url;
      //print("<pre>");print_r($data->sliders);exit();

      // post treatment
      $data->channels = (array)$data->channels;

      $template = $request->get('schedule-only') ? '_channels-schedule' : 'grid';
      $response = $this->render('SkreenHouseFactoryV3Bundle:Timeline:' . $template . '.html.twig', array(
        'data' => (array)$data
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * search
    * block html include/ajax
    */
    public function addchannelAction(Request $request)
    {
      $channels = null;
      $api = $this->get('api');
      $channels = $api->fetch('channel', array(
        'type' => 'broadcast',
        'channel_img_width' => 65,
        'q' => $request->get('q')
      ));
      //echo $api->url;

      $response = $this->render('SkreenHouseFactoryV3Bundle:Timeline:_popin-addchannel.html.twig', array(
                    'channels' => $channels,
                  ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * timelinejs
    */
    public function timelinejsAction(Request $request)
    {
      $response = $this->render('SkreenHouseFactoryV3Bundle:Timeline:timelinejs.html.twig', array(
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}
