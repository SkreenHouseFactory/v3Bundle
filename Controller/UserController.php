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
          $api = $this->get('api');
          $unsubscribed = $api->fetch('user/blacklist', array(
            'email' => $request->request->get('email'),
            'notifications' => $request->get('notifications')
            ),
            'POST'
          );
        } else {
          $error = 'Email invalide';
        }
      }
      //print_r($unsubscribed);
      $response = $this->render('SkreenHouseFactoryV3Bundle:User:blacklist.html.twig', array(
        'unsubscribed' => is_object($unsubscribed) ? $unsubscribed->success : null,
        'error' => $error
      ));

      $response->setPrivate();
      $response->setMaxAge(3600);

      return $response;
    }
  
    /**
    *
    */
    public function settingsAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $userDatas = $api->fetch('session/settings/'.$session_uid);
      if (isset($userDatas->error)) {
        return $this->redirect('http://www.myskreen.com');
      }
      $userDatas->session_uid = $session_uid;
//    print_r($userDatas);exit;
      $response = $this->render('SkreenHouseFactoryV3Bundle:User:settings.html.twig', (array)$userDatas);

      $response->setPrivate();
      $response->setMaxAge(60);

      return $response;
    }

    /**
    *
    */
    public function programsAction(Request $request)
    {
      $onglet      = $request->get('onglet');
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $params = array(
        'img_width' => 150,
        'img_height' => 200,
        'offset' => 0,
        'nb_results' => 200,
        'onglet' => $onglet,
      );
      if ($onglet == "channel") {
        $params['access'] = 'with_channels';
      }
      $programs = $api->fetch('www/slider/queue/' . $session_uid, $params);
      //echo $api->url;
      //print_r($programs);
      //not connected ?
      if (isset($programs->error) && 
          $programs->error) {
        return $this->redirect('http://www.myskreen.com');
      }

      $alpha_available = array();
      foreach ($programs as $key => $p) {
        $programs[$key]->alpha = strtolower(substr($p->title, 0, 1));
        $alpha_available[] = $programs[$key]->alpha;
      }

      //print_r(array($session_uid, $programs));
      if ($onglet == 'channel') {
        $response = $this->render('SkreenHouseFactoryV3Bundle:User:programs.html.twig', array(
          'onglet'  =>'channel',
          'onglets'  => array('channel'),
          'alpha'    => array(1,2,3,4,5,6,7,8,9,
                              'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
          'alpha_available' => $alpha_available,
          'programs' => $programs
        ));
      } else {
        $response = $this->render('SkreenHouseFactoryV3Bundle:User:programs.html.twig', array(
          'onglet'   => '',
          'onglets'  => array('films', 'documentaires', 'series', 'emissions', 'spectacles'),
          'alpha'    => array(1,2,3,4,5,6,7,8,9,
                              'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
          'alpha_available' => $alpha_available,
          'programs' => $programs
        ));
      }

      $response->setPrivate();
      $response->setMaxAge(60);

      return $response;
    }

    /**
    * video à la demande
    */
    public function vodAction(Request $request)
    {
      $onglet      = $request->get('onglet');
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $vods = $api->fetch('www/slider/vod/' . $session_uid, array(
        'img_height' => 100,
        'offset' => 0,
        'nb_results' => 200,
        'channel_img_width' => 65,
        'onglet' => $onglet
      ));
      //echo $api->url;
      //print_r($programs);
      //not connected ?
      if (isset($vods->error) && 
          $vods->error) {
        return $this->redirect('http://www.myskreen.com');
      }
      //print_r($vods);exit();
      //post treatments
      $programs = array();
      foreach ($vods as $vod) {
        $pere_id = isset($vod->program->episodeof) ? $vod->program->episodeof->id : $vod->program->id;
        $programs[$pere_id]['offers'][] = $vod;
        if (!isset($programs[$pere_id]['program'])) {
          $programs[$pere_id]['program'] = isset($vod->program->episodeof) ? $vod->program->episodeof : $vod->program;
        }
      }

      $alpha_available = array();
      foreach ($vods as $key => $v) {
        $vods[$key]->program->alpha = strtolower(substr($vods[$key]->program->title, 0, 1));
        $alpha_available[] = $vods[$key]->program->alpha;
      }

      //print_r(array($session_uid, $vods));
      $response = $this->render('SkreenHouseFactoryV3Bundle:User:vod.html.twig', array(
        'onglets'  => array('films', 'documentaires', 'series', 'emissions', 'spectacles'),
        'alpha'    => array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
        'alpha_available' => $alpha_available,
        'vods' => $programs
      ));

      $response->setPrivate();
      $response->setMaxAge(60);

      return $response;
    }
}
