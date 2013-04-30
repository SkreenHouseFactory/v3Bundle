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

class CmsController extends Controller
{
    /**
    * cms avec template
    */
    public function defaultAction(Request $request)
    {
      if (!$request->get('template')) {
        throw $this->createNotFoundException('Page does not exist');
      }
      return $this->render('SkreenHouseFactoryV3Bundle:Cms:' . $request->get('template') . '.html.twig', array(
      ));
    }

    /**
    * pages cocon
    */
    public function coconAction(Request $request)
    {
      //redirects !
      if (strstr($request->getUri(), 'tf1')) {
        $redirect = '/tf1';
      } elseif (strstr($request->getUri(), 'm6')) {
        $redirect = '/m6';
      } elseif (strstr($request->getUri(), 'france-2')) {
        $redirect = '/france-2';
      } elseif (strstr($request->getUri(), 'france-3')) {
        $redirect = '/france-3';
      } elseif (strstr($request->getUri(), 'w9')) {
        $redirect = '/w9';
      } else {
        $redirect = '/video-a-la-demande';
      }
      if (isset($redirect)) {
        return $this->redirect('http://www.myskreen.com' . $redirect, 301);
      }

      $uri = str_replace(array('http://v3.benoit.myskreen.typhon.net/app_dev.php', ':81'), array('%',''), $request->getUri());
      $api = $this->get('api');
      $datas = $api->fetch('article/cocon', array(
                 'type_id' => 8,
                 'env' => $this->get('kernel')->getEnvironment(),
                 'url' => $uri
               ));
      //echo 'uri:'.$uri;
      //echo $api->url;print_r($datas);
      return $this->render('SkreenHouseFactoryV3Bundle:Cms:cocon.html.twig', array(
        'article' => $datas
      ));
      $response->headers->set('Access-Control-Allow-Origin', '*');
      $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With');

      $response->setPublic();
      $response->setMaxAge(3600);
      //$response->headers->addCacheControlDirective('must-revalidate', true);

      return $response;
    }
}