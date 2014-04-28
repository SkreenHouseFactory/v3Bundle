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
    public function startAction(Request $request)
    {

      $api   = $this->get('api');
      $selection_pack = array();
      $params =  array(
        'channel_img_width' => 60,
        'img_width' => 150,
        'img_height' => 200,
        'fields' => 'programs,nb_followers'
      );
      /*-------------------------------------------------------------------- Les Packs pour les suggestions*/
      $obj1 = $api->fetch('www/slider/pack/7928592', $params); //pack top box office
      $obj2 = $api->fetch('www/slider/pack/3314278', $params); //pack top des séries
      $obj3 = $api->fetch('www/slider/pack/12975429', $params); //pack les plus populaires
      $obj4 = $api->fetch('www/slider/pack/12193165', $params); //pack chaînes de la Home
      //print_r($obj1);
      //echo $api->url;
      $selection_pack = array(
        'films'  => $obj1,
        'series' => $obj2,
        'emissions'  => $obj3,
        'chaines' => $obj4,
        'persons' => array(
          0 => array('title' => 'Gérard Depardieu', 'id' => 5679132),
          1 => array('title' => 'Marion Cottilard', 'id' => 5553250),
          2 => array('title' => 'Martin Scorsese', 'id' => 5630208),
          3 => array('title' => 'Scarlett Johansson', 'id' => 5231885),
          4 => array('title' => 'Jean Dujardin', 'id' => 5674357),
          5 => array('title' => 'Julia Roberts', 'id' => 5214404),
          6 => array('title' => 'George Clooney', 'id' => 5129261),
        ),
        'categories' => array(
          0 => array('title' => 'Comédie dramatique', 'id' => 18),
          1 => array('title' => 'Horreur', 'id' => 902),
          2 => array('title' => 'Tennis', 'id' => 427),
          3 => array('title' => 'Journal télévisé', 'id' => 907),
          4 => array('title' => 'Séries américaines', 'id' => 1681)
      ));

      //Tri dans le pack populaires pour ne garder que les émissions
      $emissions = array();
      $count_placeholder = 0;
      foreach ($selection_pack['emissions']->programs as $p) {
        if($p->format->name == 'Emission'){
          $emissions[] = $p;
          $count_placeholder ++;
        }
        if ($count_placeholder == 10) {
          break;
        }
      }
      $selection_pack['emissions']->programs = $emissions;

      $response = $this->render('SkreenHouseFactoryV3Bundle:User:start.html.twig', array(
        'selection_pack'=>(object)$selection_pack
      ));

      $maxage = 3600*24;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);

      return $response;
    }

    /**
    *
    */
    public function blacklistAction(Request $request)
    {
      $unsubscribed = null;
      $error = null;
      if ($request->get('notifications') && 
          (!$request->get('email') || !$request->get('token'))) {
        throw $this->createNotFoundException('Page does not exist');
        exit;
      }
      if ($request->get('email')) {
        $emailConstraint = new Email();
        $errorList = $this->get('validator')->validateValue($request->get('email'), $emailConstraint);
        if (count($errorList) == 0) {
          $api = $this->get('api');
          $params = array('email'=>$request->get('email'));
          if ($request->get('token'))
            $params['token'] = $request->get('token');
          if ($request->get('notifications'))
            $params['notifications'] = $request->get('notifications');
          $unsubscribed = $api->fetch('user/blacklist', 
                                      $params,
                                      'POST'
                          );
          //echo $api->url; exit;
        } else {
          $error = 'Email invalide';
        }
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:User:blacklist.html.twig', array(
        'unsubscribed' => is_object($unsubscribed) ? $unsubscribed->success : null,
        'error' => $error
      ));

      $response->setPrivate();
      $response->setMaxAge(0);

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

      if ($request->get('remove_card')) {
        $userDatas = $api->fetch('session/settings/'.$session_uid, array('remove_card' => $request->get('remove_card')));
        return $this->redirect($this->generateUrl('user_settings') . '#payment');
      }

      $userDatas = $api->fetch('session/settings/'.$session_uid);
      //echo $api->url;
      if (isset($userDatas->error)) {
        return $this->redirect('http://www.myskreen.com');
      }
      $userDatas->session_uid = $session_uid;
//    print_r($userDatas);exit;
      $response = $this->render('SkreenHouseFactoryV3Bundle:User:settings.html.twig', (array)$userDatas);

      $response->setPrivate();
      $response->setMaxAge(0);

      return $response;
    }

    /**
    *
    */
    public function personsAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $params = array(
        'advanced' => true,
        'session_uid' => $session_uid
      );

      $persons = $api->fetch('person', $params);
      //echo $api->url;
      //print_r($programs);
      //print_r($persons);exit();
      //get relationtype filters
      $relations = array();
      foreach ($persons as $p) {
        if (!in_array($p->main_activity, $relations)) {
          $relations[] = $p->main_activity;
        }
      }


      $response = $this->render('SkreenHouseFactoryV3Bundle:User:persons.html.twig', array(
        'persons' => $persons,
        'relations' => $relations
      ));

      $response->setPrivate();
      $response->setMaxAge(0);

      return $response;
    }

    /**
    *
    */
    public function categoryAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $params = array(
        'session_uid' => $session_uid
      );

      $categories = $api->fetch('category', $params);
      //echo $api->url;
      //print_r($programs);
      //print_r($persons);exit();
      //get relationtype filters

      $response = $this->render('SkreenHouseFactoryV3Bundle:User:category.html.twig', array(
        'categories' => $categories
      ));

      $response->setPrivate();
      $response->setMaxAge(0);

      return $response;
    }

    /**
    *
    */
    public function notifsAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $params = array(
        'session_uid' => $session_uid,
        'with_origin' => true,
        'nb_results' => 50,
        'offset' => 0,
        'time' => time()
      );

      $notifications = $api->fetch('notification', $params);
      //echo $api->url;
      //print_r($programs);
      //print_r($persons);exit();
      //get relationtype filters

      $response = $this->render('SkreenHouseFactoryV3Bundle:User:notifications.html.twig', array(
        'notifications' => $notifications
      ));

      $response->setPrivate();
      $response->setMaxAge(0);

      return $response;
    }

    /**
    *
    */
    public function theatersAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $params = array(
        'img_width' => 150,
        'img_height' => 200,
        'type' => 'cinema',
        'session_uid' => $session_uid
      );

      $theaters = $api->fetch('channel', $params);
      //echo $api->url;
      //print_r($programs);

      $response = $this->render('SkreenHouseFactoryV3Bundle:User:theaters.html.twig', array(
        'theaters' => $theaters
      ));

      $response->setPrivate();
      $response->setMaxAge(0);

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
      if ($onglet == 'channel') {
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
      //ses chaines
      if ($onglet == 'channel') {
        $response = $this->render('SkreenHouseFactoryV3Bundle:User:programs.html.twig', array(
          'onglet'  =>'channel',
          'onglets'  => array('channel'),
          'alpha'    => array(1,2,3,4,5,6,7,8,9,
                              'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
          'alpha_available' => $alpha_available,
          'programs' => $programs
        ));
      //ses programmes
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
      $response->setMaxAge(0);

      return $response;
    }

    /**
    * video à la demande
    */
    public function svodAction(Request $request)
    {
      $session_uid = $request->cookies->get('myskreen_session_uid');
      if (!$session_uid) {
        return $this->redirect('http://www.myskreen.com');
      }

      $api = $this->get('api');
      $session = $api->fetch('session/' . $session_uid, array(
        'with_svod' => true
      ));

      //print_r(array($session_uid, $vods));
      $response = $this->render('SkreenHouseFactoryV3Bundle:User:svod.html.twig', array(
        'onglets'  => array('films', 'documentaires', 'series', 'emissions', 'spectacles'),
        'svods' => $session->svods,
        'svods_available' => $session->svods_available
      ));

      $response->setPrivate();
      $response->setMaxAge(0);

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
        'nb_results' => 500,
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
      foreach ($vods as $key => $vod) {
        if (!isset($vod->program->id)) {
          unset($vods[$key]);
          continue; //adulte
        }
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
      $response->setMaxAge(0);

      return $response;
    }

    /**
    *
    */
    public function suggestAction(Request $request)
    {
      $api = $this->get('api');
      $pack = $api->fetch('www/slider/pack/12193165', array(
        'with_programs' => true
      ));

      foreach ($pack->programs as $key => $p) {
        $p->seo_url = $p->seo_url . '?follow';
        $pack->programs->{$key} = $p;
      }

      //print_r(array($session_uid, $vods));
      $response = $this->render('SkreenHouseFactoryV3Bundle:User:suggest.html.twig', array(
        'pack'  => $pack
      ));
      $response->setPublic();
      $response->setMaxAge(3600);
      $response->setSharedMaxAge(3600);

      return $response;
    }
}