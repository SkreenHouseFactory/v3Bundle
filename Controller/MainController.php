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
    *
    */
    public function homeAction(Request $request)
    {
      //menus
      //$api = new ApiManager($this->container->getParameter('kernel.environment'));
      //$menus = $api->fetch('www/menu', array('without_footer' => true));

      $response = $this->render('SkreenHouseFactoryV3Bundle:Home:home.html.twig', array(
        //'menus' => (array)$menus->menu,
        'nostat' => true
      ));
      $response->headers->set('Access-Control-Allow-Origin', '*');
      $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With');

      $response->setPublic();
      $response->setMaxAge(3600);
      //$response->headers->addCacheControlDirective('must-revalidate', true);

      return $response;
    }

    /**
    *
    */
    public function channelAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $datas = $api->fetch('channel/'.$request->get('id'), 
                           array(
                             'with_live'  => true,
                             'with_next_live' => true,
                             'with_prev_live' => true,
                             'with_description'  => true,
                             'img_width' => 150,
                             'img_height' => 200,
                             'live_img_width' => 300,
                             'live_img_height' => 300,
                             'with_epg' => true,
                             'with_replay' => true,
                             'with_best_offer' => true
                           ));
      //print_r($datas);
      //echo $api->url;
      //echo $datas->seo_url.' = '.$request->get('slug');
      //echo $request->getUri();
      if ($datas->seo_url != 'http://v3.myskreen.com/replay/'.$request->get('id').'-'.$request->get('slug') ||
          !strstr($request->getUri(), 'http://v3.')) {
        throw $this->createNotFoundException('La chaîne n\'existe pas');
      }

      return $this->render('SkreenHouseFactoryV3Bundle:Home:channel.html.twig', 
                            array('channel' => $datas)
                           );
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