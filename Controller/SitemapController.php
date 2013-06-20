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
			$api = $this->get('api');
      if ($request->get('type') == 'cinema' &&
          !$request->get('page')) {
        return $this->redirect($this->generateUrl('sitemap_channels_page', array(
          'type' => $request->get('type'), 
          'page' => 'a'
        )));
      }

      //API lastmodified
      $datas = $api->fetch('channel', array(
			 'type' => str_replace('thematique', 'thematic', $request->get('type')),
			 'q' => $request->get('page').'%',
			 'channel_img_width' => 65,
			 'offset' => $request->get('offset', 0),
			 'nb_results' => $request->get('nb_results', 100)
			));
      //echo $api->url;
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Sitemap error');
      }
      if ($request->get('type') == 'cinema') {
        $alpha_available = array(7,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','z');
      } else {
        $alpha_available = array();
        foreach ($datas as $key => $c) {
          $datas[$key]->alpha = strtolower(substr($c->name, 0, 1));
          $alpha_available[] = $datas[$key]->alpha;
        }
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Sitemap:channels.html.twig', array(
        'channels' => $datas,
        'alpha'    => array(1,2,3,4,5,6,7,8,9, 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
        'alpha_available' => $alpha_available
      ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}