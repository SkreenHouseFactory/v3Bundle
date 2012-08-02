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

class PlayerController extends Controller
{
    /**
    *
    */
    public function redirectAction(Request $request)
    {
      if (strstr('/redirection/', $request->get('target'))) {
        @list($tmp, $url) = explode('/redirection/', $request->get('target'));
        @list($url, $tmp) = explode('?', $url);
      } else {
        $url = $request->get('target');
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Player:' . $request->get('template') . '.html.twig', array(
        'url' => urldecode($url),
        'menus' => array()
      ));
    }

    /**
    *
    */
    public function liveAction(Request $request)
    {
      $api = new ApiManager();
      $channels = $api->fetch('channel', array('type' => 'broadcast', 
                                               'with_live' => true, 
                                               'player' => 'flash',
                                               'player_width' => '99%',
                                               'player_height' => '99%'));

      return $this->render('SkreenHouseFactoryV3Bundle:Player:live.html.twig', array(
        'channels' => $channels,
        'channelId' => $request->get('channel_id'),
        'menus' => array()
      ));
    }

    /**
    *
    */
    public function playerAction(Request $request)
    {

      return $this->render('SkreenHouseFactoryV3Bundle:Player:player.html.twig', array(
        'occurrenceId' => $request->get('occurrence_id')
      ));
    }
}