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

class EmbedController extends Controller
{
    private function blockDomain(Request $request) {
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'embed.') && 
          !strstr($request->getHost(), 'preprod.') && 
          !strstr($request->getHost(), '.typhon.net')) {
        throw $this->createNotFoundException('Page does not exist on this domain : ' . $request->getHost());
      }
    }

    /**
    * homes
    */
    public function videoAction(Request $request)
    {
      $this->blockDomain($request);

      $api = $this->get('api');
      $datas = $api->fetch('player/' . $request->get('id'), array(
        'img_width' => $request->get('width'),
        'img_height' => $request->get('height'),
        'slider_width' => $request->get('width'),
        'slider_height' => $request->get('height'),
        'with_program' => true
      ));
      //echo $api->url;

      //post streatment
      if (!isset($datas->program)) {
        return $this->render('SkreenHouseFactoryV3Bundle:Embed:error.html.twig', array(
          'width' => $request->get('width', '100%'),
          'height' => $request->get('height', '100%'),
        ));

      //3 freres le retour
      } elseif (in_array($datas->program->id, array(5088919))) {
        $datas->program->picture = 'http://mskstatic.com/'.$request->get('width').'/'.$request->get('height').'/b/medias/photos/LesInconnus/player-splash-3freres-retour.jpg';

      //inconnus le retour
      } elseif (in_array($datas->program->id, array(4988489))) {
        $datas->program->picture = 'http://mskstatic.com/'.$request->get('width').'/'.$request->get('height').'/b/medias/photos/LesInconnus/player-splash.jpg';
      //inconnus le retour 2
      } elseif (in_array($datas->program->id, array(5050813))) {
        $datas->program->picture = 'http://mskstatic.com/'.$request->get('width').'/'.$request->get('height').'/b/medias/photos/LesInconnus/player-splash-video2.png';

      //default
      } elseif (isset($datas->program->sliderPicture)) {
        $datas->program->picture = $datas->program->sliderPicture;
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Embed:video.html.twig', array(
        'offer' => $datas,
        'width' => $request->get('width', '100%'),
        'height' => $request->get('height', '100%'),
      ));

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
}