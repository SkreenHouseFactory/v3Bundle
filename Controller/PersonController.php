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

class PersonController extends Controller
{

    /**
    * person
    */
    public function mainAction(Request $request)
    {
      $api   = $this->get('api');
      $data = $api->fetch('person/'.$request->get('id'), array(
        'fields' => 'programs,notifications,related,photo',
        'img_width' => 150,
        'img_height' => 200,
        'channel_img_width' => 60,
        'advanced' => true,
        'offset' => $request->get('page', 1) * 30 - 30,
        'nb_results' => 30,
        'group_by_decade' => 1
      ));
      //print_r($data);
      //echo $api->url;exit;
      //404
      if (isset($data->error) && $data->error) {
        throw $this->createNotFoundException('Person does not exist');
      }
      //bad url
      if (!strstr($request->getPathInfo(), $data->seo_url)) {
        //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$data->seo_url;exit();
        return $this->redirect($data->seo_url, 301);
      }
      $data->programs = (array)$data->programs;

      //picture
      $lastdecade = (array)end($data->programs);
      $data->picture = str_replace('150/200', '240/320', $lastdecade && isset($lastdecade[0]) && isset($lastdecade[0]->picture) ? $lastdecade[0]->picture : null);

      //format
      $formats = self::getFormats($data->programs);

      $response = $this->render('SkreenHouseFactoryV3Bundle:Person:person.html.twig', array(
        'person' => $data,
        'formats' => $formats
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }
    
    
    public static function getFormats($programs) {
      $formats = array();
      foreach ($programs as $programs) {
        foreach ((array)$programs as $program) {
          if ($program->onglet) {
            $formats[$program->onglet] = $program->onglet;
          }
        }
      }
      return $formats;
    }
}