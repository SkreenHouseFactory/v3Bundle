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

class UserController extends Controller
{
    /**
    *
    */
    public function programsAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      $onglet      = $request->get('onglet', 'films');
      
      //programs
      $api = new ApiManager($this->container->getParameter('kernel.environment'));
      $programs = $api->fetch('www/slider/queue/' . $session_uid, 
                               array('img_width'  => 150,
                                     'img_height' => 200,
                                     'offset'     => 0,
                                     'nb_results' => 200,
                                     'onglet'     => $onglet));

      //print_r(array($session_uid, $programs));
      return $this->render('SkreenHouseFactoryV3Bundle:User:programs.html.twig', array(
        'menus'    => null,
        'onglets'  => array('films', 'documentaires', 'series', 'emissions', 'spectacles'),
        'programs' => $programs
      ));
    }
}