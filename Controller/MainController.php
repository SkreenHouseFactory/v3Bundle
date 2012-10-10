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
    public function proxyAction(Request $request)
    {
      $response = null;
      $method   = $request->getMethod();
      $datas    = $method == 'POST' ? $request->request->get('data') : $request->get('data');
      $url      = $method == 'POST' ? $request->request->get('url') : $request->get('url');
      $format   = $method == 'POST' ? '.json' : '';

      //hack get
      if ($method == 'GET') {
        return  new Response(file_get_contents($url . '?' . http_build_query($datas)));
      }

      /* DEPRECATED
      if (isset($datas[count($datas)-1]) &&
          $datas[count($datas)-1]['name'] == 'fromSerializeArray') {
        $tmp = array();
        foreach ($datas as $k => $v) {
          $tmp[$v['name']] = $v['value'];
        }
        $datas = $tmp;
      }
      */

      //print_r(array($url, $datas, $method));
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), $format);
      $response = $api->fetch($url, 
                              $datas, 
                              $method, 
                              array('curl.CURLOPT_SSL_VERIFYHOST' => 0, 
                                    'curl.CURLOPT_SSL_VERIFYPEER' => 0));

      return new Response(json_encode($response));
    }
}