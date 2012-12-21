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
    *
    */
    public function coconAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $datas = $api->fetch('article/'.$request->get('name'), 
                           array(
                            'type_id' => 8,
                            'url' => $request->getUri()
                           ));
      //echo 'uri:'.$request->getUri();
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