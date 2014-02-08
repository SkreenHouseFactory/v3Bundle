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

class ContentController extends Controller
{

    /**
    * category
    */
    public function categoryAction(Request $request)
    {

      if ($request->get('facet') == $request->get('category_slug')) {
        return $this->redirect(str_replace($request->get('facet').'/'.$request->get('facet'), $request->get('facet'), $request->getRequestUri()), 301);
      } elseif ($request->get('access') == 'vod') {
        return $this->redirect(str_replace('/vod', '/video-a-la-demande', $request->getRequestUri()), 301);
      } elseif ($request->get('access') == 'liste') {
        return $this->redirect($this->generateUrl('format', array('category_slug' => $request->get('category_slug'))), 301);
      }

      $is_route_format = in_array($request->get('_route'), array('format', 'format_facet', 'format_page')) ? true : false;
      $api   = $this->get('api');
      $data = $api->fetch($is_route_format ? 'format' : 'category', array(
         'from_slug'  => str_replace('/', '', strlen($request->get('facet'))>1?$request->get('facet'):$request->get('category_slug')),
         'with_description' => true,
         //'with_subcategories' => true,
         'with_programs'  => true,
         'with_onglet' => true,
         'img_width' => 150,
         'img_height' => 200,
         'channel_img_width' => 60,
         'channel_img_height' => 60,
         'offset' => $request->get('page', 1) * 30 - 30,
         'nb_results' => 30,
         'facets' => $this->buildFacets($request),
          'disable_search_by_format' => true
       ));

      //echo "\n".'api:' . $api->url;
      //echo "\n".'category_slug:' . $request->get('category_slug');
      //echo "\n".'facet:' . $request->get('facet');
      //echo "\n".'access:' . $request->get('access');
      //echo "\n".'route:'  .$request->get('_route');
      //exit();
      //print_r($data->facets);
      //404
      if (isset($data->error) && $data->error) {
        throw $this->createNotFoundException('Category does not exist');
      }
      // 301 
      if (isset($data->redirect)) {
        return $this->redirect('/'.$request->get('format').$data->redirect, 301);
      }
      //bad url
      if (strstr($request->getPathInfo(), $data->seo_url)) {
        if ($this->container->getParameter('kernel.environment') == 'dev') {
          //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$data->seo_url . '/';exit();
        }
        //return $this->redirect($data->seo_url, 301);
      }

      $data->programs = (array)$data->programs;
      if (count($data->programs) == 0) {
        if (isset($data->root)) {
          return $this->redirect('/'.$request->get('format').$data->root->seo_url, 301);
        } else {
          return $this->redirect('/'.$request->get('format', $request->get('category_slug')), 301);
        }
      }

      $data->picture = str_replace('150/200', '240/320', isset($data->programs[0]) && is_object($data->programs[0]) ? $data->programs[0]->picture : null);

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:category.html.twig', array(
        'facet_access' => array(
          'video-a-la-demande'=> 'Vidéo à la demande', 
          'replay'=> 'Replay', 
          'tv'=> 'TV', 
          'cinema'=> 'Cinéma', 
          'dvd'=> 'Dvd, Blu-Ray'
        ),
        'category' => $data,
        'formats' => array_combine(explode(';', $data->facets_seo_url->format),explode(';', $data->facets->format)),
        'categories' => array_combine(explode(';', $data->facets_seo_url->category),explode(';', $data->facets->category)),
        'subcategories' => array_combine(explode(';', $data->facets_seo_url->subcategory),explode(';', $data->facets->subcategory)),
        'access' => explode(';', $data->facets->access),
        'channels' => array_combine(explode(';', $data->facets_seo_url->channel),explode(';', $data->facets->channel)),
        'alpha_available' => explode(';', $data->facets->alpha),
        'alpha' => array(1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * person
    */
    public function personAction(Request $request)
    {

      $api   = $this->get('api');
      $data = $api->fetch('person/'.$request->get('id'), array(
        'with_programs' => true,
        'img_width' => 150,
        'img_height' => 200,
        'channel_img_width' => 60,
        'advanced' => true,
        'offset' => $request->get('page', 1) * 30 - 30,
        'nb_results' => 30,
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
      $data->picture = str_replace('150/200', '240/320', isset($data->programs[0]) && is_object($data->programs[0]) && isset($data->programs[0]->picture) ? $data->programs[0]->picture : null);

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:person.html.twig', array(
        'person' => $data
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * selection
    */
    public function selectionAction(Request $request)
    {

      $api   = $this->get('api');
      $data = $api->fetch('www/slider/pack/'.$request->get('id'), array(
        'with_description'  => true,
        'channel_img_width' => 60,
        'img_width' => 150,
        'img_height' => 200,
        'with_onglet'  => true,
        'with_programs' => true,
        'img_width' => 150,
        'img_height' => 200
      ));
      //print_r($data);
      //echo $api->url;
      //404
      if (isset($data->error) && $data->error) {
        throw $this->createNotFoundException('Selection does not exist');
      }
      $data->programs = (array)$data->programs;
      $programs = array_values($data->programs);
      $program = isset($programs[0]) ? $programs[0] : null;
      $data->picture = str_replace('150/200', '240/320', isset($program) && is_object($program) ? $program->picture : null);
        if ($request->get('partner')) {
        $response = $this->render('SkreenHouseFactoryPartnersBundle:'.$request->get('partner').':selection.html.twig', array(
          'selection' => $data
        ));
      } else {
        $custom_header = false;
        $from_selection = true;
        $is_channel = false;
        if ( $data->onglet->type == 'page'){
          $is_channel = true;
          if ( $this->get('templating')->exists('SkreenHouseFactoryV3Bundle:Channel:_header-'.$data->onglet->channel->id.'.html.twig')){
            $custom_header = true;
          }
        }
        //bad url
        if ($request->getPathInfo() != $data->seo_url) {
          //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$data->seo_url . '/';
          return $this->redirect($data->seo_url, 301);
        }
        $response = $this->render('SkreenHouseFactoryV3Bundle:Content:selection.html.twig', array(
          'selection' => $data,
          'custom_header' => $custom_header,
          'from_selection'=> $from_selection,
          'is_channel' => $is_channel
        ));
      }

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);

      return $response;
    }

    protected function buildFacets(Request $request) {
      //echo '$facet:'.$request->get('facet');
      //echo '$route:'.$request->get('_route');
      $facets = array();
      if (strlen($request->get('facet')) == 1) {
        $facets[] = 'alpha:' . $request->get('facet');
      } elseif (in_array($request->get('facet'), array('video-a-la-demande', 'cinema'))) {
        $facets[] = 'access:' . str_replace(array('video-a-la-demande'), array('vod'), $request->get('facet'));
      } elseif ($request->get('facet')) {
        if (in_array($request->get('_route'), array('channel_format_facet', 'channel_format_facet_page'))) {
          $facets[] = 'category:' . $request->get('facet');
        } else {
          $facets[] = 'subcategory:' . $request->get('facet');
        }
      }
      if ($request->get('format')) {
        $facets[] = 'format:' . $request->get('format');
      }
      if ($request->get('access')) {
        $facets[] = 'access:' . str_replace(
          array('video-a-la-demande', 'tv', 'replay', 'cinema', 'dvd'), 
          array('vod', 'tv', 'catchup', 'cinema', 'dvd'), 
          $request->get('access')
        );
      }

      return implode(',', $facets);
    }
}