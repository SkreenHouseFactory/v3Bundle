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
use Symfony\Component\Validator\Constraints\Email;

use SkreenHouseFactory\v3Bundle\Api\ApiManager;

class UserController extends Controller
{
    /**
    *
    */
    public function blacklistAction(Request $request)
    {
      $unsubscribed = null;
      $error = null;
      if ($request->request->get('email')) {
        $emailConstraint = new Email();
        $errorList = $this->get('validator')->validateValue($request->request->get('email'), $emailConstraint);
        
        if (count($errorList) == 0) {
          $api = new ApiManager($this->container->getParameter('kernel.environment'));
          $unsubscribed = $api->fetch('user/blacklist',
                                      array('email' => $request->request->get('email'),
                                            'notifications' => $request->get('notifications')),
                                      'POST');
        } else {
          $error = 'Email invalide';
        }
      }
      //print_r($unsubscribed);
      return $this->render('SkreenHouseFactoryV3Bundle:User:blacklist.html.twig', array(
        'unsubscribed' => is_object($unsubscribed) ? $unsubscribed->success : null,
        'error' => $error
      ));
    }
  
    /**
    *
    */
    public function programsAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      $onglet      = $request->get('onglet');
      
      //programs
      $api = new ApiManager($this->container->getParameter('kernel.environment'));
      $programs = $api->fetch('www/slider/queue/' . $session_uid, 
                               array('img_width'  => 150,
                                     'img_height' => 200,
                                     'offset'     => 0,
                                     'nb_results' => 200,
                                     'onglet'     => $onglet));
      //print_r($programs);
      //not connected ?
      if (isset($programs->error) && $programs->error) {
        return $this->redirect('http://www.myskreen.com');
      }

      $alpha_available = array();
      foreach ($programs as $key => $p) {
        $programs[$key]->alpha = strtolower(substr($p->title, 0, 1));
        $alpha_available[] = $programs[$key]->alpha;
      }

      //print_r(array($session_uid, $programs));
      return $this->render('SkreenHouseFactoryV3Bundle:User:programs.html.twig', array(
        'menus'    => null,
        'onglets'  => array('films', 'documentaires', 'series', 'emissions', 'spectacles'),
        'alpha'    => array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
        'alpha_available' => $alpha_available,
        'programs' => $programs
      ));
    }
}