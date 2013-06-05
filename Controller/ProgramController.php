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

class ProgramController extends Controller
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
    * saga program
    */
    public function sagaAction(Request $request)
    {
      $this->blockDomain($request);
      $api = $this->get('api');
      $data = $api->fetch('saga/'.$request->get('id'), array(
        'img_width' => 150,
        'img_height' => 200,
      ));
      //echo $api->url;
      $response = $this->render('SkreenHouseFactoryV3Bundle:Program:saga.html.twig', array(
        'saga' => $data
      ));

      $maxage = 3600;
      $response->setPublic();
      $response->setMaxAge($maxage);
      $response->setSharedMaxAge($maxage);
    
      return $response;
    }

    /**
    * program
    */
    public function programAction(Request $request)
    {
      $this->blockDomain($request);
      $api = $this->get('api');

      //redirect v1 route
      if ($request->get('from_occurrence')) {
        $data = $api->fetch('player/'.$request->get('id'), array(
          'with_program' => true
        ));
        if ($data->program && $data->program->id) {
          return $this->redirect($data->program->seo_url, 301);
        } else {
          return $this->redirect('/');
        }
      }

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
          'with_tweets' => true,
          'with_empty_player' => true
          //'filter_casting' => true,
          //'player' => 'flash'
        ));

        //print("<pre>");print_r($datas);
        //echo $api->url;exit();
        if ($this->get('kernel')->getEnvironment() == 'dev' && 
            $request->get('debug')) {
          echo $api->url;
        }
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
            return $this->redirect('/app_dev.php' . $datas->seo_url, 301);;
          //  return new Response('redirect '.$request->getPathInfo().' != '.$datas->seo_url.' => '.($request->getPathInfo() != $datas->seo_url));
          }
          return $this->redirect($datas->seo_url, 301);
        }

        //hack img dev
        if ($request->get('imgdev')) {
          $datas->img = preg_replace('/s(\d)\.mskstatic.com/', 'mskstatic.dev-new.myskreen.typhon.net', $datas->img);
        }

        // -- post treatments
        $datas->offers = (array)$datas->offers;
        //description with html_entity_decode
        $datas->description_text = strip_tags(html_entity_decode($datas->description_seo));
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
        //player
        if ($datas->teaser) {
          $datas->player = $datas->teaser;
        } elseif (count($datas->offers['plays']) > 0) {
          foreach ($datas->offers['plays'] as $o) {
            if (isset($o->deporte) && $o->deporte && !$o->cost) {
              $datas->player = $o;
              break;
            }
          }
        } elseif (count($datas->offers['bonus']) > 0) {
          foreach ($datas->offers['bonus'] as $o) {
            if (isset($o->deporte) && 
                $o->deporte && 
                $o->channel_id != 5325) { //except cultcut
              $datas->player = $o;
              break;
            }
          }
        } elseif (count($datas->offers['cuts']) > 0) {
          foreach ($datas->offers['cuts'] as $o) {
            if (isset($o->deporte) && 
                $o->deporte && 
                $o->channel_id != 5325) { //except cultcut
              $datas->player = $o;
              break;
            }
          }
        }
        //load related programs
        $datas->related = (array)$datas->related;
        /* now loaded in API
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

        if (array_key_exists('chaines',$datas->related) && count($datas->related['chaines']->programs) == 1) {
          $p = $datas->related['chaines']->programs[0];
          // MODIFICATION DU FORMAT DE L'IMAGE DE LA CHAINE
          $p->picture = str_replace("/150/200/","/245/120/",$p->picture);
          $datas->related['chaines']->programs[0] = $p;
        }

        if (strstr($datas->title, ' - ')) {
          list($_, $datas->episode_title) = explode(' - ', $datas->title);
        }

        //footer
        list($_, $format, $__) = explode('/', $datas->seo_url);
        $request->request->set('home', $format != 'programme' ? $format : null);

        $response = $this->render('SkreenHouseFactoryV3Bundle:Program:program.html.twig', array(
          'program' => $datas,
          'offers' => array(//'deportes' => 'sur mySkreen', 
                            'plays' => 'Replay & VOD', 
                            'broadcasts' => 'Télé', 
                            'itunes' => 'iTunes', 
                            'boxs' => 'Box',
                            'dvds' => 'DVD', 
                            'theaters' => 'Ciné',  
                            'cuts' => 'Extraits', 
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
}