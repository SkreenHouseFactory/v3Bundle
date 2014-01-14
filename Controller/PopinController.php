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

class PopinController extends Controller
{
    /**
    * signup
    */
    public function signupAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Popin:signup.html.twig', array(
      ));
    }

    /**
    * checkout
    */
    public function checkoutAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Popin:checkout.html.twig', array(
      ));
    }
}