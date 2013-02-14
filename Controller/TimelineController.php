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

class TimelineController extends Controller
{
    /**
    * grid
    */
    public function gridAction(Request $request)
    {
      $api  = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $data = $api->fetch('schedule/epg', array(
                            'timestamp' => $request->get('timestamp', mktime(date('H'),0,0,date('m'),date('d'),date('Y'))),
                            'with_player' => true,
                            'img_width' => 150,
                            'img_height' => 200,
														'channel_img_width' => 40,
                            //'with_related_sliders' => true
                          ));
			//echo $api->url;
			// post treatment
			$data->channels = (array)$data->channels;

			$template = $request->get('schedule-only') ? '_grid-schedule' : 'grid';
      $response = $this->render('SkreenHouseFactoryV3Bundle:Timeline:' . $template . '.html.twig', array(
				'data' => (array)$data
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * search
    * block html include/ajax
    */
    public function addchannelAction(Request $request)
    {
      $channels = null;
      $api = new ApiManager($this->container->getParameter('kernel.environment'), '.json');
      $channels = $api->fetch('channel', array(
                    'type' => 'broadcast',
                    'q' => $request->get('q')
                  ));
      //echo $api->url;

      $response = $this->render('SkreenHouseFactoryV3Bundle:Timeline:_popin-addchannel.html.twig', array(
                'channels' => $channels,
             ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * timelinejs
    */
    public function timelinejsAction(Request $request)
    {
      $response = $this->render('SkreenHouseFactoryV3Bundle:Timeline:timelinejs.html.twig', array(
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}
