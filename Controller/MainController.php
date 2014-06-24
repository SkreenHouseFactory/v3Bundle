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
          !strstr($request->getHost(), 'myskreen.') && 
          !strstr($request->getHost(), 'preprod-') && 
          !strstr($request->getHost(), '.typhon.net')) {
        throw $this->createNotFoundException('Page does not exist on this domain : ' . $request->getHost());
      }
    }

    /**
    * apps
    */
    public function appsinstallAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Main:appsinstall.html.twig', array(
      ));
    }

    /**
    * header
    */
    public function headerAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Main:_header.html.twig', array(
        'home' => $request->get('home'),
        'route' => $request->get('route'),
        'q' => $request->get('q')
      ));
    }
    /**
    * NEW header
    */
    public function newheaderAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Main:_header-burger.html.twig', array(
        'home' => $request->get('home'),
        'route' => $request->get('route'),
        'q' => $request->get('q')
      ));
    }
    /**
    * header suggest channels
    */
    public function headerchannelAction(Request $request)
    {
      $api = $this->get('api');
      $pack = $api->fetch('www/slider/pack/12193165', array(
        'with_programs' => true,
        'channel_slider_width' => 150,
        'channel_slider_height' => 73
      ));

      foreach ($pack->programs as $key => $p) {
        $p->seo_url = $p->seo_url . '?follow';
        $pack->programs->{$key} = $p;
      }

      //print_r(array($session_uid, $vods));
      $response = $this->render('SkreenHouseFactoryV3Bundle:Main:_headerchannel.html.twig', array(
        'pack'  => $pack
      ));
      $response->setPublic();
      $response->setMaxAge(3600);
      $response->setSharedMaxAge(3600);

      return $response;
    }

    /**
    * footer
    */
    public function footerAction(Request $request)
    {
      return $this->render('SkreenHouseFactoryV3Bundle:Main:_footer.html.twig', array(
		    'home' => $request->get('home'),
        'route' => $request->get('route'),
        'q' => $request->get('q')
      ));
    }

    /**
    * homes
    */
    public function homeAction(Request $request)
    {
      $this->blockDomain($request);

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
        'img_width' => 150,
        'img_height' => 200,
        'channel_slider_width' => 225,
        'channel_slider_height' => 110,
        //'slider_height' => 450,
        'slider_width' => 'auto',
        'channel_img_width' => 50,
        'fields' => 'programs,teaser,footer,img_maxsize'
      ));
      //echo $api->url;exit;
      //print_r($datas);
      $response = $this->render('SkreenHouseFactoryV3Bundle:Home:home.html.twig', array(
        'home' => $datas
      ));

      $maxage = 300;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * page slider
    */
    public function pagesliderAction(Request $request)
    {
      $api = $this->get('api');
      $programs = $api->fetch($request->get('api-url'), array(
        'programs_only' => true,
        'offset' => 0, //$request->get('offset', 0),
        'nb_results' => 6, //$request->get('nb_results', 6),
        'exclude_ids' => $request->get('exclude_ids'),
        'img_width' => $request->get('img_width'),
        'img_height' => $request->get('img_height'),
        'slider_img_width' => $request->get('slider_img_width'),
        'slider_img_height' => $request->get('slider_img_height')
      ));
      //echo $api->url;
      return $this->render('SkreenHouseFactoryV3Bundle:Slider:_page.html.twig', array(
		    'programs'=> $programs
      ));
    }

    /**
    * search
    */
    public function searchAction(Request $request)
    {
      $this->blockDomain($request);
      $request->attributes->set('q', urldecode($request->get('q')));
      $facets = $request->get('facets') ? $facets : ($request->get('format') ? 'format:' . $request->get('format') : null);
      $api = $this->get('api');
      $datas = $api->fetch(
        'search/' .urlencode(str_replace('.', '%2E',  $request->get('q'))), 
        array(
          'img_width' => 160,
          'img_height' => 200,
          'channel_img_width' => 80,
          'channel_img_height' => 70,
          'nb_results' => 30,
          'with_new' => 1,
          'facets' => $facets
      ));
      //echo 'q:'.$request->get('q');
      //echo $api->url;exit;
      //print_r($datas);exit;

      if (is_array($datas) && array_key_exists('spelling',$datas)) {
        if (count($datas->spelling) > 1)
          $datas->spelling = array($datas->spelling[0]);
      }

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
      if ($request->get('video')) {
        if ($request->get('new')) {
          return $this->redirect('http://api.myskreen.com/sitemapvideonewindex/500.xml', 301);
        } else {
          return $this->redirect('http://api.myskreen.com/sitemapvideoindex/500.xml', 301);
        }   
      } else {
        return $this->redirect('http://api.myskreen.com/sitemapindex/500.xml', 301);
      }
    }

    /**
    *
    */
    public function notfoundAction(Request $request)
    {
      if (substr($request->get('url'), 0, 1) == '/') {
        return $this->redirect($this->generateUrl(
          'any_url', 
          array('url' => substr($request->get('url'), 1, strlen($request->get('url'))-1)), 301)
        );
      }
      
      //echo 'url:'.$request->get('url');exit();
      if (substr($request->get('url'),0,25) == 'theatre-concert-spectacle') {
        return $this->redirect('/'.str_replace('theatre-concert-spectacle', 'concert', $request->get('url')), 301);
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
      $format   = $method == 'POST' && preg_match('/\/api\//', $request->get('url')) ? '.json' : null;

      if (!is_array($datas)) {
        $datas = array();
      }

      // HACK get
      if ($method == 'GET') {
        //echo $url . '?' . http_build_query($datas);
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

      $api   = new ApiManager($format);
      $response = $api->fetch(
        $url, 
        $datas, 
        $method, 
        array(
          'curl.CURLOPT_SSL_VERIFYHOST' => 0, 
          'curl.CURLOPT_SSL_VERIFYPEER' => 0
      ));

      //echo 'HERE:'.$api->url;exit();
      return new Response(json_encode($response));
    }
}