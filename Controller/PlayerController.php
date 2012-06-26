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

class PlayerController extends Controller
{
    /**
    *
    */
    public function redirectAction(Request $request)
    {

      return $this->render('SkreenHouseFactoryV3Bundle:Player:redirect.html.twig', array(
        'url' => $request->get('url')
      ));
    }

    /**
    *
    */
    public function liveAction(Request $request)
    {

      return $this->render('SkreenHouseFactoryV3Bundle:Player:live.html.twig', array(
        'channelId' => $request->get('channel_id')
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