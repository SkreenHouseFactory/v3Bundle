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

class SessionController extends Controller
{
    /**
    *
    */
    public function playlistAction(Request $request)
    {      
      if ($request->get('type') == 'selector') {
        return $this->render('SkreenHouseFactoryV3Bundle:Main:_selector.html.twig', array(
          'addClass' => 'to_animate'
        ));
      } else {
        return $this->render('SkreenHouseFactoryV3Bundle:Main:_playlist.html.twig', array(
          'type' => 'playlist.'.$request->get('type'),
          'addClass' => 'to_animate'
        ));
      }
    }
}