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

class SitemapController extends Controller
{
		private function blockDomain(Request $request) {
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'www.') && 
          !strstr($request->getHost(), 'preprod.')) {
        throw $this->createNotFoundException('Page does not exist');
      }
		}

    /**
    * program
    */
    public function channelsAction(Request $request)
    {
			$this->blockDomain($request);
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);

      //API lastmodified
      $datas = $api->fetch('channel', array(
								 'type' => $request->get('type'),
								 'offset' => $request->get('offset', 0),
								 'nb_results' => $request->get('nb_results', 100)
               ));
      //echo $api->url;
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Sitemap error');
      }
      $response = $this->render('SkreenHouseFactoryV3Bundle:Sitemap:channels.html.twig', array(
        'channels' => $datas
      ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}