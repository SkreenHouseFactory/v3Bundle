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
    private function blockDomain(Request $request) {
      if ($this->get('kernel')->getEnvironment() == 'prod' && 
          !strstr($request->getHost(), 'www.') && 
          !strstr($request->getHost(), 'replay.') && 
          !strstr($request->getHost(), 'preprod.') && 
          !strstr($request->getHost(), '.typhon.net')) {
        throw $this->createNotFoundException('Page does not exist');
      }
    }

    /**
    * channel
    */
    public function channelAction(Request $request)
    {

      $this->blockDomain($request);

      $api   = $this->get('api');
      $params = array(
        'from_slug'  => $request->get('slug'),
        'with_live'  => !$request->get('format') && !$request->get('page') ? true : false,
        'with_next_live' => !$request->get('format') && !$request->get('page') ? true : false,
        //'with_prev_live' => true,
        'with_description'  => true,
        'channel_img_width' => 120,
        'img_width' => 150,
        'img_height' => 200,
        'live_img_width' => 150,
        'live_img_height' => 200,
        'slider_img_width'  => 900,
        'slider_img_height' => 300,
        'live_player_width' => 450,
        'live_player_height' => 300,
        'with_epg' => !$request->get('format') && !$request->get('page') ? true : false,
        'with_replay' => !$request->get('format') && !$request->get('page') ? true : false,
        'with_best_offer' => !$request->get('format') && !$request->get('page') ? true : false,
        'with_programs' => true,
        'offset' => $request->get('page', 1) * 30 - 30,
        'nb_results' => 30,
        'facets' => $this->buildFacets($request)
      );

      // Gestion du mode preview
      if ($request->get("preview") == 1) {
        $params['preview'] = 1;
      }

      $datas = $api->fetch('channel', $params);

      //print("<pre>");print_r($datas);
      //echo $api->url;
      //exit;
      //404
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Channel does not exist');
      }
      //redirect fournisseur synonyme
      if (isset($datas->redirect) && $datas->redirect) {
        return $this->redirect($datas->redirect, 301);
      }

      // Si on est une une page sk_channel, on redirige vers le twig correct
      if (property_exists($datas,'channel')) {
        $params = array(
          'data' => $datas,
          'channel' => $datas->channel,
        );
        if ($datas->channel->type == 'ChannelFournisseur') {
          $formats = explode(';', $datas->facets->format);
          if (property_exists($datas,"facets_seo_url"))
            $formats = array_combine(explode(';', $datas->facets_seo_url->format),$formats);
          $params['formats'] = $formats;
          $params['subcategories'] = array_combine(explode(';', $datas->facets_seo_url->subcategory),explode(';', $datas->facets->subcategory));
          $params['alpha_available'] = explode(';', $datas->facets->alpha);
          $params['alpha'] = array(1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
        }

        $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:channel.html.twig', $params);
        if ($request->get('slug') != $datas->channel->slug) {
          // Alias du channel fourni
          return $this->redirect('/' . $datas->channel->slug, 301);
        }
      } else {
        //bad url
        if (($request->getPathInfo() != $datas->seo_url &&
            $request->getPathInfo() != $datas->seo_url . $request->get('format') . '/' &&
            $request->getPathInfo() != $datas->seo_url . $request->get('format') . '/' . $request->get('facet') . '/' &&
            $request->getPathInfo() != $datas->seo_url . 'page-' . $request->get('page') . '/' &&
            $request->getPathInfo() != $datas->seo_url . $request->get('facet') . '/') &&
            (!property_exists($datas,'channel') || str_replace('/','',$request->getPathInfo()) != $datas->channel->slug)
            ) {
          if ($this->container->getParameter('kernel.environment') == 'dev') {
            echo "\n".'facet: ' . $datas->seo_url . '/' . $request->get('facet') . '/';
            echo "\n".'format: ' . $datas->seo_url . '/' . $request->get('format') . '/';
            echo "\n".'format+cat: ' . $datas->seo_url . '/' . $request->get('format') . '/' . $request->get('facet') . '/';
            echo "\n".'page: ' . $datas->seo_url . '/page-' . $request->get('page') . '/';
            echo "\n".'default '.$request->getPathInfo().' != '.$datas->seo_url.'/ => '.($request->getPathInfo() != $datas->seo_url);
            echo "\n".'redirect '.$datas->seo_url;
            exit();
          }
          return $this->redirect($datas->seo_url, 301);
        }
        $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);
        //$template = isset($datas->epg) && $datas->epg ? 'channel-replay' : 'channel';

        $response = $this->render('SkreenHouseFactoryV3Bundle:Channel:fournisseur.html.twig', array(
          'channel' => $datas,
          'formats' => array_combine(explode(';', $datas->facets_seo_url->format),explode(';', $datas->facets->format)),
          'subcategories' => array_combine(explode(';', $datas->facets_seo_url->subcategory),explode(';', $datas->facets->subcategory)),
          'alpha_available' => explode(';', $datas->facets->alpha),
          'alpha'    => array(1,2,3,4,5,6,7,8,9,
                              'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')
        ));
      }

      $maxage = 120;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
      
      return $response;
    }

    /**
    * category
    */
    public function categoryAction(Request $request)
    {
      $this->blockDomain($request);
      $is_route_format = in_array($request->get('_route'), array('format', 'format_facet', 'format_page')) ? true : false;
      $api   = $this->get('api');
      $datas = $api->fetch($is_route_format ? 'format' : 'category', array(
         'from_slug'  => str_replace('/', '', $request->get('category_slug')),
         'with_description' => true,
         //'with_subcategories' => true,
         'with_programs'  => true,
         'with_onglet' => true,
         'img_width' => 150,
         'img_height' => 200,
         'offset' => $request->get('page', 1) * 30 - 30,
         'nb_results' => 30,
         'facets' => $this->buildFacets($request)
       ));
      //echo "\n".'api:' . $api->url;
      //echo "\n".'category_slug:' . $request->get('category_slug');
      //echo "\n".'route:'  .$request->get('_route');
      //exit();
      //print_r($datas);
      //404
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Category does not exist');
      }
      //bad url
      if (strstr($request->getPathInfo(), $datas->seo_url)) {
        if ($this->container->getParameter('kernel.environment') == 'dev') {
          //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';exit();
        }
        //return $this->redirect($datas->seo_url, 301);
      }
      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:category.html.twig', array(
        'is_route_format' => $is_route_format,
        'category' => $datas,
        'formats' => array_combine(explode(';', $datas->facets_seo_url->format),explode(';', $datas->facets->format)),
        'categories' => array_combine(explode(';', $datas->facets_seo_url->category),explode(';', $datas->facets->category)),
        'subcategories' => array_combine(explode(';', $datas->facets_seo_url->subcategory),explode(';', $datas->facets->subcategory)),
        'alpha_available' => explode(';', $datas->facets->alpha),
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
      $this->blockDomain($request);
      $api   = $this->get('api');
      $datas = $api->fetch('person/'.$request->get('id'), array(
        'with_programs' => true,
        'img_width' => 150,
        'img_height' => 200,
        'advanced' => true,
        'offset' => $request->get('page', 1) * 30 - 30,
        'nb_results' => 30,
      ));
      //print_r($datas);
      //echo $api->url;exit;
      //404
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Person does not exist');
      }
      //bad url
      if (!strstr($request->getPathInfo(), $datas->seo_url)) {
        //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url;exit();
        return $this->redirect($datas->seo_url, 301);
      }

      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:person.html.twig', array(
        'person' => $datas
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
      $this->blockDomain($request);
      $api   = $this->get('api');
      $datas = $api->fetch('www/slider/pack/'.$request->get('id'), array(
        'with_programs'  => true,
        'with_onglet'  => true,
        'img_width' => 150,
        'img_height' => 200
      ));
      //print_r($datas);
      //echo $api->url;
      //404
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Selection does not exist');
      }

      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);

      if ($request->get('partner')) {
        $response = $this->render('SkreenHouseFactoryPartnersBundle:'.$request->get('partner').':selection.html.twig', array(
          'selection' => $datas
        ));
      } else {
        //bad url
        if ($request->getPathInfo() != $datas->seo_url) {
          //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';
          return $this->redirect($datas->seo_url, 301);
        }

        $response = $this->render('SkreenHouseFactoryV3Bundle:Content:selection.html.twig', array(
          'selection' => $datas
        ));
      }

      $maxage = 600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);

      return $response;
    }

    protected function buildFacets(Request $request) {
      $facets = array();
      if (strlen($request->get('facet')) == 1) {
        $facets[] = 'alpha:' . $request->get('facet');
      } elseif (in_array($request->get('facet'), array('video-a-la-demande', 'cinema'))) {
        $facets[] = 'access:' . str_replace(array('video-a-la-demande'), array('vod'), $request->get('facet'));
      } elseif ($request->get('facet')) {
        $facets[] = 'subcategory:' . $request->get('facet');
      }
      if ($request->get('format')) {
        $facets[] = 'format:' . $request->get('format');
      }
      if ($request->get('access')) {
        $facets[] = 'access:' . str_replace(array('video-a-la-demande'), array('vod'), $request->get('access'));
      }

      return implode(',', $facets);
    }
}