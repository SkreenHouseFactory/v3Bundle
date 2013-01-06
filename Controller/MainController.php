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
    * homes
    */
    public function homeAction(Request $request)
    {
      switch ($request->get('home')) {
        case 'film':
        case 'serie':
        case 'documentaire':
        case 'emission':
        case 'spectacle':
          $home = $request->get('home') . 's';
        break;
        case 'replay':
          $home = 'tv-replay';
        break;
        case 'streaming':
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
      
      //menus
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('www/home/' . $home, 
                           array('without_footer' => true,
                                 'img_width' => 160,
                                 'img_height' => 200,
                                 'with_programs' => true));
      //echo $api->url;

      $response = $this->render('SkreenHouseFactoryV3Bundle:Home:home.html.twig', array(
        'sliders' => $datas->sliders,
      ));

      /*
      $response->headers->set('Access-Control-Allow-Origin', '*');
      $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With');

      $response->setPublic();
      $response->setMaxAge(3600);
      //$response->headers->addCacheControlDirective('must-revalidate', true);
      */

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
                                 'nb_results' => 10));
      //echo $api->url;

      return $this->render('SkreenHouseFactoryV3Bundle:Search:main.html.twig', array(
        'results' => $datas,
      ));
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