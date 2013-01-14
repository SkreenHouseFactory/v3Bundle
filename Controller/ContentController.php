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
    * program
    */
    public function programAction(Request $request)
    {
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);

      //API lastmodified
      $datas = $api->fetch('cache', array(
                  'model' => 'Programme',
                  'id' => $request->get('id')
                ));
      $cache_date = new \DateTime($datas->updated_at);

      //cache
      $cache_maxage = 600;
      $cache_etag = md5('program-' . $request->get('id') . '-'. $datas->updated_at);

      // Créer un objet Response avec un en-tête ETag
      // et/ou un en-tête Last-Modified
      $response = new Response();
      $response->setETag($cache_etag);
      $response->setLastModified($cache_date);
  
      // Définit la réponse comme publique. Sinon elle sera privée par défaut.
      $response->setPublic();

      // Vérifier que l'objet Response n'est pas modifié
      // pour un objet Request donné
      if ($this->get('kernel')->getEnvironment() != 'dev' && $response->isNotModified($request)) {
          // Retourner immédiatement un objet 304 Response

      } else {
        //$response->expire();

        //echo $request->get('id');echo $request->get('_route');exit();
        $datas = $api->fetch('program/'.$request->get('id'), 
                             array(
                               'img_width' => 450,
                               'img_height' => 600,
                               'episode_img_width' => 80,
                               'episode_img_height' => 50,
                               'episode_img_crop' => 50,
                               'channel_img_width' => 65,
                               'with_metadata'  => true,
                               'with_related' => true,
                               'with_offers' => true,
                               'with_teaser' => true,
                               //'filter_casting' => true,
                               //'player' => 'flash'
                             ));

        //print_r($datas);
        //echo $api->url;

        //check url
        //echo $request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url);exit();
        //TODO
        if ($request->get('season_number')) {
          foreach ($datas->seasons as $s) {
            if ($s->number == $request->get('season_number')) {
              return $this->redirect($s->episodes[0]->seo_url);
            }
          }
          echo 'redirect fail : episode 1 saison '.$request->get('season_number');exit();
        }
        if ($request->getPathInfo() != $datas->seo_url) {
          echo 'redirect '.$request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url);exit();
          return $this->redirect($datas->seo_url);
        }
        // -- post treatments
        //episodes
        $datas->offers = (array)$datas->offers;
        if (!isset($datas->episodeof) && 
            isset($datas->datas_offers->episodes) && count((array)$datas->datas_offers->episodes) > 1) {
          foreach ((array)$datas->datas_offers->episodes as $e) {
            $datas->episode_list[$e->title] = $e;
          }
          ksort($datas->episode_list);
        }
        //theaters     
        if (!$datas->offers['theaters'] && !$datas->offers['theaters_on_demand']) {
          $datas->offers['theaters'] = array();
        } else {
          $datas->datas_theaters = array('theaters_ids' => explode(',', $datas->offers['theaters']),
                                         'theaters_on_demand' => $datas->offers['theaters_on_demand']);
          $datas->offers['theaters'] = ($datas->offers['theaters'] ? count($datas->offers['theaters']) : 0) +  
                                       ($datas->offers['theaters_on_demand'] ? count($datas->offers['theaters_on_demand']) : 0);
        }
  
        //load related programs
        foreach ($datas->related as $key => $r) {
          //print_r($r);
          $datas->related[$key]->programs = (array)$api->fetch(str_replace('&onglet', '&_onglet', $r->paginate), 
                                                                array(
                                                                  'img_width' => 150,
                                                                  'img_height' => 200,
                                                                  'programs_only' => true,
                                                                  'channel_img_width' => 50,
                                                                  'nb_results' => 7,
                                                                ));
          //echo "\n name:".$r->name.' url:'.$api->url;
          //echo "\n name:".$r->name.' : '.end($datas->related[$key]->programs)->id;
        }
        
        if (isset($datas->sagas) && count($datas->sagas) > 0) {
          $datas->related = array_merge($datas->sagas, $datas->related);
        }

        $response = $this->render('SkreenHouseFactoryV3Bundle:Content:program.html.twig', array(
          'program' => $datas,
          'offers' => array('deportes' => 'sur mySkreen', 
                            'plays' => 'Replay et VOD', 
                            'broadcasts' => 'A la télé', 
                            'theaters' => 'Au cinéma',
                            'itunes' => 'iTunes', 
                            'dvds' => 'En Dvd', 
                            'boxs' => 'Sur les box')
        ));

        $response->setCache(array(
            'etag'          => $cache_etag,
            'last_modified' => $cache_date,
            'max_age'       => $cache_maxage,
            's_maxage'      => $cache_maxage,
            'public'        => true,
            // 'private'    => true,
        ));
      }

      return $response;
    }

    /**
    * channel
    */
    public function channelAction(Request $request)
    {

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('channel', array(
                            'from_slug'  => $request->get('slug'),
                            'with_live'  => true,
                            'with_next_live' => true,
                            //'with_prev_live' => true,
                            'with_description'  => true,
                            'img_width' => 150,
                            'img_height' => 200,
                            'live_img_width' => 300,
                            'live_img_height' => 300,
                            'slider_img_width'  => 900,
                            'slider_img_height' => 300,
                            'with_epg' => true,
                            'with_replay' => true,
                            'with_best_offer' => true,
                            'with_programs' => true,
                            'offset' => $request->get('page') * 30,
                            'nb_results' => 30,
                            'facets' => $this->buildFacets($request)
                          ));
      //print_r($datas);
      //echo $api->url;
        //echo $request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url);exit();
        if ($request->getPathInfo() != '/' . $datas->seo_url . '/' &&
            $request->getPathInfo() != '/' . $datas->seo_url . '/page-' . $request->get('page') . '/' &&
            $request->getPathInfo() != '/' . $datas->seo_url . '/' . $request->get('facet') . '/'
            ) {
          //echo 'redirect '.$request->getPathInfo().' != /'.$datas->seo_url.'/ => '.($request->getPathInfo() != $datas->seo_url);exit();
          return $this->redirect('/'.$datas->seo_url.'/');
        }
      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);
      //$template = isset($datas->epg) && $datas->epg ? 'channel-replay' : 'channel';
      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:channel.html.twig', array(
        'channel' => $datas,
        'formats' => array_combine(explode(';', $datas->facets_seo_url->format),explode(';', $datas->facets->format)),
        'subcategories' => array_combine(explode(';', $datas->facets_seo_url->subcategory),explode(';', $datas->facets->subcategory)),
        'alpha_available' => explode(';', $datas->facets->alpha),
        'alpha'    => array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')
      ));

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

      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('category', 
                           array(
                             'from_slug'  => str_replace('/', '', $request->get('category_slug')),
                             'with_description' => true,
                             //'with_subcategories' => true,
                             'with_programs'  => true,
                             'img_width' => 150,
                             'img_height' => 200,
                             'offset' => $request->get('page') * 30,
                             'nb_results' => 30,
                             'facets' => $this->buildFacets($request)
                           ));
      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);
      //print_r($datas);
      //echo $api->url;
      if (!strstr($request->getPathInfo(), $datas->seo_url)) {
        //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';exit();
        return $this->redirect($datas->seo_url);
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:category.html.twig', array(
        'category' => $datas,
        'formats' => array_combine(explode(';', $datas->facets_seo_url->format),explode(';', $datas->facets->format)),
        'subcategories' => array_combine(explode(';', $datas->facets_seo_url->subcategory),explode(';', $datas->facets->subcategory)),
        'alpha_available' => explode(';', $datas->facets->alpha),
        'alpha'    => array(1,2,3,4,5,6,7,8,9,
                            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z')
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
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('person/'.$request->get('id'), 
                           array(
                             'with_programs' => true,
                             'img_width' => 150,
                             'img_height' => 200,
                             'advanced' => true,
                             'offset' => $request->get('page') * 30,
                             'nb_results' => 30,
                           ));
      //print_r($datas);
      //echo $api->url;
      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);
      if ($request->getPathInfo() != $datas->seo_url . '/') {
        //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';exit();
        return $this->redirect($datas->seo_url);
      }

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
      $api   = new ApiManager($this->container->getParameter('kernel.environment'), '.json', 2);
      $datas = $api->fetch('www/slider/pack/'.$request->get('id'), 
                           array(
                             'with_programs'  => true,
                             'with_onglet'  => true,
                             'img_width' => 150,
                             'img_height' => 200
                           ));
      //print_r($datas);
      //echo $api->url;
      //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';
      if ($request->getPathInfo() != $datas->seo_url) {
        return $this->redirect($datas->seo_url);
      }

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:selection.html.twig', array(
        'selection' => $datas
      ));

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
      } elseif ($request->get('facet')) {
        $facets[] = 'subcategory:' . $request->get('facet');
      }
      if ($request->get('format')) {
        $facets[] = 'format:' . $request->get('format');
      }
      
      return implode(',', $facets);
    }
}