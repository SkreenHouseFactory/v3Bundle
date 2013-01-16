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

class MainController extends Controller
{

    /**
    * header
    */
    public function headerAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Home:header.html.twig', array(
      ));
    }

    /**
    * homes
    */
    public function homeAction(Request $request)
    {
      
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'www.') && 
          !strstr($request->getHost(), 'preprod.')) {
        throw $this->createNotFoundException('Home does not exist');
      }
      
      switch ($request->get('home')) {
        case 'films':
        case 'series':
        case 'documentaires':
        case 'emissions':
        case 'spectacles':
        case 'jeunesse':
          $redirect = substr($request->get('home'), 0, strlen($request->get('home'))-1);
        break;
        case 'vod':
          $redirect = 'video-a-la-demande';
        break;
        case 'jeunesse':
          $redirect = 'dessin-anime-et-manga';
        break;
        case 'cine':
          $redirect = 'cinema';
        break;
        
        case 'film':
        case 'serie':
        case 'documentaire':
        case 'emission':
        case 'spectacle':
          $home = $request->get('home') . 's';
        break;
        case 'video-a-la-demande':
          $home = 'vod';
        break;
        case 'dessin-anime-et-manga':
          $home = 'jeunesse';
        break;
        case 'cinema':
          $home = 'cine';
        break;
        case '':
          $home = 'mixte';
        break;
        default:
          $home = $request->get('home');
        break;
      }
      

      if (isset($redirect)) {
        //echo 'redirect '.$redirect;exit();
        return $this->redirect('/'.$redirect.'/');
      }

      //menus
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('www/home/' . $home, 
                           array('without_footer' => true,
                                 'with_programs' => true,
                                 'img_width' => 160,
                                 'img_height' => 200,
                                 'with_teaser' => true,
                                 'slider_width' => 990));
      //echo $api->url;


      $response = $this->render('SkreenHouseFactoryV3Bundle:Home:home.html.twig', array(
        'home' => $datas
      ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * search
    */
    public function searchAction(Request $request)
    {
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);

      $datas = $api->fetch('search/' . urlencode($request->get('q')), 
                           array('img_width' => 160,
                                 'img_height' => 200,
                                 'nb_results' => 7));
      //echo $api->url;
      $response = $this->render('SkreenHouseFactoryV3Bundle:Search:main.html.twig', array(
        'results' => $datas,
      ));

      $maxage = 300;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * search
    */
    public function boostAction(Request $request)
    {
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);

      $datas = $api->fetch('www/slider/pack/8774489', 
                           array('programs_only' => true));
      //echo $api->url;
      $response = $this->render('SkreenHouseFactoryV3Bundle:Main:_boost.html.twig', array(
        'programs' => $datas,
      ));


      $maxage = 300;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    *
    */
    public function proxyAction(Request $request)
    {
      $response = null;
      $method   = $request->getMethod();
      $datas    = $method == 'POST' ? $request->request->get('data') : $request->get('data');
      $url      = $method == 'POST' ? $request->request->get('url') : $request->get('url');
      $format   = $method == 'POST' ? '.json' : null;

      if (!is_array($datas)) {
        $datas = array();
      }

      // HACK get
      if ($method == 'GET') {
        return  new Response(file_get_contents($url . '?' . http_build_query($datas)));
      }

      //print_r($datas);exit();
      // HACK jquery serialize form
      foreach ($datas as $key => $value) {
        if (preg_match('/^(.*)\[(.*)\]\[(.*)$/', $key, $matches)) {
          //print_r($matches);
          $datas[$matches[1]][$matches[2]][$matches[3]] = $value;
          unset($datas[$key]);
        } elseif (preg_match('/^(.*)\[(.*)$/', $key, $matches)) {
          //print_r($matches);
          $datas[$matches[1]][$matches[2]] = $value;
          unset($datas[$key]);
        }
      }
//      print_r($datas);

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), $format);
      $response = $api->fetch($url, 
                              $datas, 
                              $method, 
                              array('curl.CURLOPT_SSL_VERIFYHOST' => 0, 
                                    'curl.CURLOPT_SSL_VERIFYPEER' => 0));

      //echo 'HERE';exit();
      return new Response(json_encode($response));
    }
}