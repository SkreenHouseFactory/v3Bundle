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
    private function blockDomain(Request $request) {
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'www.') && 
          !strstr($request->getHost(), 'preprod.') && 
          !strstr($request->getHost(), '.typhon.net')) {
        throw $this->createNotFoundException('Page does not exist on this domain : ' . $request->getHost());
      }
    }

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
      $this->blockDomain($request);
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'www.') && 
          !strstr($request->getHost(), 'preprod.') && 
          !strstr($request->getHost(), '.typhon.net')) {
        if (!strstr($request->getHost(), 'replay.')) {
          $redirect = $this->generateUrl('tvgrid');
        }
        //if (!strstr($request->getHost(), 'tv.')) {
        //  return $this->redirect('http://tv.myskreen.com/video/replay/', 301);
        //}
        throw $this->createNotFoundException('Home does not exist');
      }

      switch ($request->get('home')) {
        case 'tv-replay':
          $redirect = $this->generateUrl('tvgrid');
        break;
        case 'films':
        case 'series':
        case 'documentaires':
        case 'emissions':
        case 'spectacles':
          $redirect = $this->generateUrl('homes', array('home' => substr($request->get('home'), 0, strlen($request->get('home'))-1)));
        break;
        case 'vod':
          $redirect = $this->generateUrl('homes', array('home' => 'video-a-la-demande'));
        break;
        case 'cine':
          $redirect = $this->generateUrl('homes', array('home' => 'cinema'));
        break;
        
        case 'film':
        case 'serie':
        case 'documentaire':
        case 'emission':
        case 'spectacle':
        case 'jeunesse':
          if ($request->get('_route') != 'homes_vod') {
            $redirect = $this->generateUrl('homes_vod', array('home' => $request->get('home')));
          } else {
            $home = $request->get('home') . ($request->get('home') != 'jeunesse' ? 's' : null);
          }
        break;
        case 'video-a-la-demande':
          $home = 'vod';
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
        return $this->redirect($redirect, 301);
      }

      $api = $this->get('api');
      $datas = $api->fetch('www/home/' . $home, array(
        'without_footer' => true,
        'with_programs' => true,
        'img_width' => 160,
        'img_height' => 200,
        'with_teaser' => true,
        'with_pass' => true,
        'slider_width' => 1500,
        'slider_height' => 450
      ));
      //echo $api->url;
      //print_r($datas);
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
      $this->blockDomain($request);
      $facets = $request->get('facets') ? $facets : ($request->get('format') ? 'format:' . $request->get('format') : null);
      $api = $this->get('api');
      $datas = $api->fetch('search/' .urlencode(str_replace('.', '%2E',  $request->get('q'))), 
                           array('img_width' => 160,
                                 'img_height' => 200,
                                 'nb_results' => 30,
                                 'with_new' => 1,
                                 'facets' => $facets));
      //echo $api->url;
      //print_r($datas);
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
      $api = $this->get('api');
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
    public function sitemapAction(Request $request)
    {
      return $this->redirect('http://api.myskreen.com/sitemapindex/500.xml', 301);
    }

    /**
    *
    */
    public function notfoundAction(Request $request)
    {
      if (substr($request->get('url'), 0, 1) == '/') {
        return $this->redirect($this->generateUrl('any_url', array('url' => substr($request->get('url'), 1, strlen($request->get('url'))-1)), 301));
      }
      throw $this->createNotFoundException('Page does not exist');
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