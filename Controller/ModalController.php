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

class ModalController extends Controller
{

    /**
    * publish playlist
    */
    public function publishplaylistAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Modal:publish-playlist.html.twig', array(
      ));
    }

    /**
    * signup
    */
    public function signupAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Modal:signup.html.twig', array(
      ));
    }

    /**
    * signin
    */
    public function signinAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Modal:signin.html.twig', array(
      ));
    }

    /**
    * checkout
    */
    public function checkoutAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Modal:checkout.html.twig', array(
      ));
    }
}