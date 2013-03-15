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
          !strstr($request->getHost(), 'preprod.') && 
          !strstr($request->getHost(), '.typhon.net')) {
        throw $this->createNotFoundException('Page does not exist');
      }
		}

    /**
    * program
    */
    public function programAction(Request $request)
    {
			$this->blockDomain($request);
			$api = $this->get('api');

      //API lastmodified
      //$datas = $api->fetch('status/cache/program/' . $request->get('id'));
      //echo $api->url;
      //if (isset($datas->error) && $datas->error) {
      //  throw $this->createNotFoundException('Programme does not exist');
      //}
      //$cache_date = new \DateTime($datas->updated_at);

      //cache
      $cache_maxage = 600;
      //$cache_etag = md5('program-' . $request->get('id') . '-'. $datas->updated_at);

      // Créer un objet Response avec un en-tête ETag
      // et/ou un en-tête Last-Modified
      $response = new Response();
      //$response->setETag($cache_etag);
      //$response->setLastModified($cache_date);

      // Vérifier que l'objet Response n'est pas modifié
      // pour un objet Request donné
      if (false &&
					 $this->get('kernel')->getEnvironment() != 'dev' && 
          $response->isNotModified($request)) {
          // Retourner immédiatement un objet 304 Response
          mail('benoit@myskreen.com',
               '[v3][program isNotModified] program-' . $request->get('id') . '-'. $datas->updated_at,
							 print_r($response, true));
      } else {
        //$response->expire();

        //echo $request->get('id');echo $request->get('_route');exit();
        $datas = $api->fetch('program/'.$request->get('id'), array(
          'img_width' => 400,
          'img_height' => 550,
          'episode_img_width' => 80,
          'episode_img_height' => 50,
          'episode_img_crop' => 50,
          'channel_img_width' => 65,
          'with_img' => '245,330',
          'with_metadata' => true,
          'with_related' => true,
					'with_related_programs' => true,
          'with_offers' => true,
          'with_teaser' => true,
          'with_hashtags' => true,
          'with_tweets' => true
          //'filter_casting' => true,
          //'player' => 'flash'
        ));

        //print_r($datas);
        //echo $api->url;
				//stop Adulte
        if (isset($datas->error)) {
        	throw $this->createNotFoundException('Program error : ' . $datas->error);
				}
        //check url
        //echo $request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url);exit();
        //TODO
        if ($request->get('season_number')) {
          foreach ($datas->seasons as $s) {
            if ($s->number == $request->get('season_number')) {
              return $this->redirect($s->episodes[0]->seo_url, 301);
            }
          }
          echo 'redirect fail : episode 1 saison '.$request->get('season_number');exit();
        }
        if ($request->getPathInfo() != $datas->seo_url) {
          if ($this->get('kernel')->getEnvironment() == 'dev') {
            return new Response('redirect '.$request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url));
          }
          return $this->redirect($datas->seo_url, 301);
        }
        // -- post treatments
        $datas->offers = (array)$datas->offers;
				//episodes list
        if (!isset($datas->episodeof) && 
            isset($datas->datas_offers->episodes) && count((array)$datas->datas_offers->episodes) > 1) {
          foreach ((array)$datas->datas_offers->episodes as $e) {
            $datas->episode_list[$e->title] = $e;
          }
          ksort($datas->episode_list);
        }
        //list episode offers
        $datas->offers_default = null;
				foreach ($datas->offers as $type => $offers) {
					if (count($offers) > 0) {
        		$datas->offers_default = $type;
						break;
					}
				}
        //add other episodes offers
				//$datas->offers = array_merge_recursive($datas->offers, (array)$datas->episodeof->offers);
				// ==> pas suffisant : il faut éviter la répetition lorsque l'on est sur un épisode
				if (isset($datas->episodeof->offers)) {
					foreach ($datas->episodeof->offers as $key => $offers) {
						foreach ($offers as $offer) {
							if (isset($offer->episode_id) && $offer->episode_id != $datas->id) {
								$datas->offers[$key][] = $offer;
							}
						}
					}
				}
        //theaters     
        if (!$datas->offers['theaters'] && !$datas->offers['theaters_on_demand']) {
          $datas->offers['theaters'] = array();
        } else {
          $datas->datas_theaters = array(
						'theaters_ids' => $datas->offers['theaters'] ? explode(',', $datas->offers['theaters']) : array(),
            'theaters_on_demand' => $datas->offers['theaters_on_demand']
					);
          $datas->offers['theaters'] = ($datas->offers['theaters'] ? count($datas->offers['theaters']) : 0) +  
                                       ($datas->offers['theaters_on_demand'] ? count($datas->offers['theaters_on_demand']) : 0);
        }

        //load related programs
				$datas->related = (array)$datas->related;
        /*
				foreach ($datas->related as $key => $r) {
          $datas->related[$key]->programs = (array)$api->fetch(str_replace('&onglet', '&_onglet', $r->url), array(
                                                      'img_width' => 150,
                                                      'img_height' => 200,
                                                      'programs_only' => true,
                                                      'channel_img_width' => 50,
                                                      'nb_results' => $r->paginate ? 7 : 50,
                                                    ));
          if (count($datas->related[$key]->programs) > 0) {
            $datas->has_related = true;
            //echo "\n name:".$r->name.' url:'.$api->url;
            //echo "\n name:".$r->name.' : '.end($datas->related[$key]->programs)->id;
          }
        }
				*/
        
        if (isset($datas->sagas) && count($datas->sagas) > 0) {
          $datas->related = array_merge($datas->sagas, $datas->related);
        }
        
        if (strstr($datas->title, ' - ')) {
          list($_, $datas->episode_title) = explode(' - ', $datas->title);
        }

        //footer
        list($_, $format, $__) = explode('/', $datas->seo_url);
        $request->request->set('home', $format != 'programme' ? $format : null);

        $response = $this->render('SkreenHouseFactoryV3Bundle:Content:program.html.twig', array(
          'program' => $datas,
          'offers' => array(//'deportes' => 'sur mySkreen', 
                            'plays' => 'Replay & VOD', 
                            'broadcasts' => 'Télé', 
                            'itunes' => 'iTunes', 
                            'boxs' => 'Box',
                            'dvds' => 'DVD', 
                            'theaters' => 'Ciné', 
                            'archives' => 'Archives')
        ));
      }

      $response->setCache(array(
          //'etag'          => $cache_etag,
          //'last_modified' => $cache_date,
          'max_age'       => $cache_maxage,
          's_maxage'      => $cache_maxage,
          'public'        => true,
          // 'private'    => true,
      ));

      return $response;
    }

    /**
    * channel
    */
    public function channelAction(Request $request)
    {
			$this->blockDomain($request);

      $api   = $this->get('api');
      $datas = $api->fetch('channel', array(
        'from_slug'  => $request->get('slug'),
        'with_live'  => !$request->get('format') && !$request->get('page') ? true : false,
        'with_next_live' => !$request->get('format') && !$request->get('page') ? true : false,
        //'with_prev_live' => true,
        'with_description'  => true,
        'channel_img_width' => 50,
        'img_width' => 150,
        'img_height' => 200,
        'live_img_width' => 300,
        'live_img_height' => 300,
        'slider_img_width'  => 900,
        'slider_img_height' => 300,
        'with_epg' => !$request->get('format') && !$request->get('page') ? true : false,
        'with_replay' => !$request->get('format') && !$request->get('page') ? true : false,
        'with_best_offer' => !$request->get('format') && !$request->get('page') ? true : false,
        'with_programs' => true,
        'offset' => $request->get('page', 1) * 30 - 30,
        'nb_results' => 30,
        'facets' => $this->buildFacets($request)
      ));
      //print_r($datas);
      //echo $api->url;
      //404
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Channel does not exist');
      }
      //bad url
      if ($request->getPathInfo() != $datas->seo_url &&
          $request->getPathInfo() != $datas->seo_url . $request->get('format') . '/' &&
          $request->getPathInfo() != $datas->seo_url . $request->get('format') . '/' . $request->get('facet') . '/' &&
          $request->getPathInfo() != $datas->seo_url . 'page-' . $request->get('page') . '/' &&
          $request->getPathInfo() != $datas->seo_url . $request->get('facet') . '/'
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
			$this->blockDomain($request);
      $api   = $this->get('api');
      $datas = $api->fetch(in_array($request->get('_route'), array('format', 'format_facet', 'format_page')) ? 'format' : 'category', array(
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
      //echo "\n".'api:' . $api->url;exit();
      //echo "\n".'route:'  .$request->get('_route');
      //print_r($datas);
      //404
      if (isset($datas->error) && $datas->error) {
        throw $this->createNotFoundException('Category does not exist');
      }
      //bad url
      if (!strstr($request->getPathInfo(), $datas->seo_url)) {
        //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';exit();
        return $this->redirect($datas->seo_url, 301);
      }
      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);

      $response = $this->render('SkreenHouseFactoryV3Bundle:Content:category.html.twig', array(
        'category' => $datas,
        'formats' => array_combine(explode(';', $datas->facets_seo_url->format),explode(';', $datas->facets->format)),
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
      //echo $api->url;
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
      //bad url
      if ($request->getPathInfo() != $datas->seo_url) {
        //echo "\n".'getPathInfo:'.$request->getPathInfo().' != seo_url:'.$datas->seo_url . '/';
        return $this->redirect($datas->seo_url, 301);
      }

      $datas->picture = str_replace('150/200', '240/320', isset($datas->programs[0]) && is_object($datas->programs[0]) ? $datas->programs[0]->picture : null);

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
